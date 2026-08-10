package com.angkor.commerce.product.impl;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.category.CategoryRepository;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.common.storage.*;
import com.angkor.commerce.product.ProductService;
import com.angkor.commerce.product.dto.request.CreateProductRequest;
import com.angkor.commerce.product.dto.request.CreateProductVariantRequest;
import com.angkor.commerce.product.dto.request.ProductImageRequest;
import com.angkor.commerce.product.dto.request.ProductQueryParams;
import com.angkor.commerce.product.dto.request.UpdateProductRequest;
import com.angkor.commerce.product.dto.request.UpdateProductVariantRequest;
import com.angkor.commerce.product.dto.response.ProductAggregate;
import com.angkor.commerce.product.dto.response.ProductDeleteResponse;
import com.angkor.commerce.product.dto.response.ProductImageResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import com.angkor.commerce.product.dto.response.ProductSummaryResponse;
import com.angkor.commerce.product.dto.response.ProductVariantResponse;
import com.angkor.commerce.product.entities.Product;
import com.angkor.commerce.product.entities.ProductImage;
import com.angkor.commerce.product.entities.ProductVariant;
import com.angkor.commerce.product.mapper.ProductMapper;
import com.angkor.commerce.product.repositories.ProductImageRepository;
import com.angkor.commerce.product.repositories.ProductRepository;
import com.angkor.commerce.product.repositories.ProductVariantRepository;
import com.angkor.commerce.product.specificaion.ProductSpecification;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/*
profile service
*/
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    // Inject repositories and another helpers here --
    // load from property instead

    private final ImageProperties imageProperties;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper mapper;
    private final ImageStorageService imageStorageService;
    private final ThumbnailGenerator thumbnailGenerator;
    private final ImageValidator imageValidator;
    private final StorageCleanup storageCleanup;

    @Value("${angkor.default-currency:USD}")
    private String defaultCurrency;

    private static final String COLLECTION_KEY = "products";

    @Override
    @Transactional()
    public ProductResponse createProduct(CreateProductRequest request) {
        Category cat = loadCategory(request.categoryId());

        // check sku with request
        validateSkuUniqueWithinRequest(request.variants());
        // assert if each is available
        request.variants().forEach(variant -> assertSkuAvailable(variant.sku(), null));

        Product saved = productRepository.save(mapper.toEntity(request, cat, defaultCurrency));

        List<ProductVariant> variants = request
            .variants()
            .stream()
            .map(v -> toVariant(saved, v))
            .toList();

        variantRepository.saveAll(variants); // batch save

        //        List<ProductImage> images = buildImages(saved, request.images());
        //        if (!images.isEmpty()) {
        //            imageRepository.saveAll(images);
        //        }
        return buildFullResponse(saved);
    }

    @Override
    @Transactional()
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = loadProduct(id);

        if (request.title() != null) product.setName(request.title());
        if (request.description() != null) product.setDescription(request.description());
        if (request.price() != null) product.setPrice(request.price());
        if (request.currency() != null) product.setCurrency(request.currency());
        if (request.unit() != null) product.setUnit(request.unit());
        if (request.thumbnailUrl() != null) product.setThumbnailUrl(request.thumbnailUrl());
        if (request.status() != null) product.setStatus(request.status());
        if (request.discountPercentage() != null) {
            product.setDiscountPercentage(request.discountPercentage());
        }
        if (request.categoryId() != null && !request.categoryId().equals(product.getCategory().getId())) {
            product.setCategory(loadCategory(request.categoryId()));
        }

        return buildFullResponse(productRepository.save(product));
    }

    @Override
    @Transactional()
    public ProductDeleteResponse deleteProduct(Long id) {
        Product product = loadProduct(id);
        product.setStatus(RecordStatus.DELETED);
        return new ProductDeleteResponse(product.getId(), product.getName(), product.getStatus(), true, Instant.now());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return buildFullResponse(loadProduct(id));
    }

    @Override
    public PageResponse<ProductSummaryResponse> getProducts(ProductQueryParams query) {
        Page<Product> page = this.productRepository.findAll(ProductSpecification.from(query), query.toPageable());

        if (page.isEmpty()) {
            return PageResponse.empty(COLLECTION_KEY, query.skipOrDefault(), query.limitOrDefault());
        }

        Map<Long, ProductAggregate> aggregates = variantRepository
            .aggragateByProductIds(page.getContent().stream().map(Product::getId).toList())
            .stream()
            .collect(toMap(ProductAggregate::getProductId, identity()));

        List<ProductSummaryResponse> items = page
            .getContent()
            .stream()
            .map(p -> mapper.toSummary(p, aggregates.get(p.getId())))
            .toList();

        return PageResponse.of(
            COLLECTION_KEY,
            items,
            page.getTotalElements(),
            query.skipOrDefault(),
            query.limitOrDefault()
        );
    }

    @Override
    @Transactional()
    public ProductVariantResponse addVariant(Long productId, CreateProductVariantRequest request) {
        Product product = loadProduct(productId);
        assertSkuAvailable(request.sku(), null);
        ProductVariant variant = variantRepository.save(toVariant(product, request));
        return mapper.toVariantResponse(variant, product);
    }

    @Override
    @Transactional()
    public ProductVariantResponse updateVariant(Long productId, Long variantId, UpdateProductVariantRequest request) {
        Product product = loadProduct(productId);
        ProductVariant variant = loadProductVariant(productId, variantId);

        if (request.sku() != null && !request.sku().equals(variant.getSku())) {
            assertSkuAvailable(request.sku(), variantId);
            variant.setSku(request.sku());
        }
        if (request.size() != null) variant.setSize(request.size());
        if (request.stock() != null) variant.setStock(request.stock());
        if (request.priceOverride() != null) variant.setPriceOverride(request.priceOverride());
        return mapper.toVariantResponse(variant, product);
    }

    @Override
    @Transactional()
    public void deleteVariant(Long productId, Long variantId) {
        ProductVariant variant = loadProductVariant(productId, variantId);
        if (variantRepository.countByProductId(productId) <= 1) {
            throw new ValidationException(
                "Cannot delete the last variant of a product. Deactivate the product instead."
            );
        }

        variantRepository.delete(variant);
    }

    @Override
    @Transactional()
    public ProductImageResponse addImage(Long productId, MultipartFile file, Integer order) {
        Product product = loadProduct(productId);
        if (imageRepository.countByProductId(productId) >= maxImagesPerProduct()) {
            throw new ValidationException("A product cannot have more than " + maxImagesPerProduct() + " images");
        }

        imageValidator.validate(file); // magic-byte check, throws on bad input
        StoredImage original = this.imageStorageService.upload(file, ImagePurpose.PRODUCT_MAIN, productId);
        StoredImage thumbnail;

        try {
            thumbnail = imageStorageService.uploadBytes(
                thumbnailGenerator.generate(file),
                "image/jpeg",
                "jpg",
                ImagePurpose.PRODUCT_THUMBNAIL,
                productId
            );
        } catch (RuntimeException e) {
            // Don't leave the original orphaned if thumbnailing fails

            imageStorageService.deleteQuietly(List.of(original.objectKey()));
            throw e;
        }
        //
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(original.objectKey());
        image.setThumbnailUrl(thumbnail.objectKey());
        image.setDisplayOrder(ProductMapper.defaultIfNull(order, imageRepository.findMaxDisplayOrder(productId) + 1));

        ProductImage saved = imageRepository.save(image);
        if (product.getThumbnailUrl() == null) {
            product.setThumbnailUrl(thumbnail.objectKey());
        }

        // If anything later in this transaction fails, drop what we uploaded
        storageCleanup.onRollback(original.objectKey(), thumbnail.objectKey());
        return mapper.toImageResponse(saved);
    }

    @Override
    @Transactional()
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = imageRepository
            .findByIdAndProductId(imageId, productId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Image " + imageId + " was not found for product " + productId)
            );

        Product product = image.getProduct();

        // Capture the keys before delete -
        String imageKey = image.getImageUrl();
        String thumbnailKey = image.getThumbnailUrl();
        // Promote the next image rather than leaving the product thumbnail-less
        if (Objects.equals(product.getThumbnailUrl(), image.getThumbnailUrl())) {
            product.setThumbnailUrl(
                imageRepository
                    .findByProductIdOrderByDisplayOrderAscIdAsc(productId)
                    .stream()
                    .filter(i -> !i.getId().equals(imageId))
                    .findFirst()
                    .map(ProductImage::getThumbnailUrl)
                    .orElse(null)
            );
        }
        imageRepository.delete(image); // delete from repo
        // Objects go only once  the row is durably gone.
        storageCleanup.onCommit(imageKey, thumbnailKey);
    }

    // ── Helpers ───────────────────────────────────────────────

    private Product loadProduct(Long id) {
        return productRepository
            .findById(id)
            .filter(p -> p.getStatus() != RecordStatus.DELETED)
            .orElseThrow(() -> notFound(id));
    }

    private ProductVariant loadProductVariant(Long productId, Long variantId) {
        return variantRepository
            .findByIdAndProductId(variantId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Variant with ID " + variantId + " was not found"));
    }

    private Category loadCategory(Long categoryId) {
        return categoryRepository
            .findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category with ID " + categoryId + " was not found"));
    }

    private void assertSkuAvailable(String sku, Long excludingVariantId) {
        boolean token =
            excludingVariantId == null
                ? variantRepository.existsBySku(sku)
                : variantRepository.existsBySkuAndIdNot(sku, excludingVariantId);
        if (token) {
            throw new ValidationException("SKU '" + sku + "' is already in use");
        }
    }

    private void validateSkuUniqueWithinRequest(List<CreateProductVariantRequest> variants) {
        Set<String> seen = new HashSet<>();

        // Throw exception  as soon as the same SKU appears more than once.
        variants
            .stream()
            .map(CreateProductVariantRequest::sku)
            .filter(sku -> !seen.add(sku))
            .findFirst()
            .ifPresent(dup -> {
                throw new ValidationException("Duplicate SKU in request: " + dup);
            });
    }

    private ProductVariant toVariant(Product product, CreateProductVariantRequest request) {
        // Instance an object for product variant
        ProductVariant productVariant = new ProductVariant();
        productVariant.setProduct(product);
        productVariant.setSize(request.size());
        productVariant.setSku(request.sku());
        productVariant.setStock(request.stock());
        productVariant.setPriceOverride(request.priceOverride());
        return productVariant;
    }

    private List<ProductImage> buildImages(Product product, List<ProductImageRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        return IntStream.range(0, requests.size())
            .mapToObj(i -> {
                ProductImageRequest request = requests.get(i);
                ProductImage productImage = new ProductImage();
                productImage.setProduct(product);
                productImage.setImageUrl(request.imageUrl());
                productImage.setThumbnailUrl(request.thumbnailUrl());
                productImage.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : i);
                return productImage;
            })
            .toList();
    }

    private ResourceNotFoundException notFound(Long id) {
        return new ResourceNotFoundException("Product with ID " + id + " was not found");
    }

    private ProductResponse buildFullResponse(Product product) {
        return mapper.toResponse(
            product,
            variantRepository.findByProductIdOrderByIdAsc(product.getId()),
            imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(product.getId())
        );
    }

    private long maxImagesPerProduct() {
        return imageProperties.maxPerProduct();
    }
}
