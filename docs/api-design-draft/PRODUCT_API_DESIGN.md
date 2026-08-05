# Product module — API design (`core-api`)

Status: **not applied yet** — reference design with copy-paste-ready code for the empty scaffolds
already sitting in `product/` (`ProductController.java`, `ProductRepository.java`, `ProductService.java`,
`impl/ProductServiceImpl.java`, `dto/request/{Create,Update}ProductRequest.java`, `dto/response/ProductResponse.java`).
Say the word and I'll fill them in for real.

## ⚠️ Naming correction first

`docs/CORE_API_DATA_MODEL.md` (root) says the `Product` field is `title`. That's now **stale** —
`V4__rename_product_title.sql` renamed the column back `title → name`, and `Product.java` already has
`private String name;`. So this design uses **`name`** throughout, matching what's actually in the
database and the entity today. That also means the customer-portal implementation doc from earlier in
this thread (`apps/customer-portal/docs/PRODUCT_FULL_OBJECT_IMPLEMENTATION.md`), which used `title` per
the stale doc, is now wrong on that one field — happy to patch it to `name` when you're ready, just say so.

## What already exists vs. what this designs

| File                                                                                                                                                                                                                                                              | State                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Product.java`, `ProductVariant.java`, `ProductImage.java`                                                                                                                                                                                                        | ✅ already written, unchanged by this design                                                                                                                                                       |
| `ProductRepository.java`, `ProductService.java`, `impl/ProductServiceImpl.java`, `ProductController.java`, `dto/request/*`, `dto/response/ProductResponse.java`                                                                                                   | 🧱 empty scaffolds — this design fills them in                                                                                                                                                     |
| `ProductVariantRepository.java`, `ProductImageRepository.java`, `ProductSpecifications.java`, `StorefrontProductController.java`, `dto/response/ProductDetailResponse.java`, `dto/response/ProductVariantResponse.java`, `dto/response/ProductImageResponse.java` | 🆕 new files this design adds                                                                                                                                                                      |
| `CategoryRepository.findBySlug`, `CategoryService.getDescendantCategoryIds`                                                                                                                                                                                       | 🆕 small additions to the existing category module (storefront needs slug→id and parent→descendants resolution, same problem `customer-portal`'s `category-helpers.ts` already solves client-side) |
| `ApiConstants`, `SecurityConfig`                                                                                                                                                                                                                                  | ✏️ small additions (two new base-path constants, two new matcher rules)                                                                                                                            |

## Two controllers, one service — mirrors the `auth` module's existing split

`docs/CORE_API_ENDPOINTS.md` lists Products as **two separate route groups**, not one shared route like
categories: staff `GET /products?skip=&limit=&search=&categoryId=` vs. storefront
`GET /storefront/products?skip=&limit=&categorySlug=&search=&minPrice=&maxPrice=`. That's a real
difference, not just cosmetic — storefront is always scoped to `status = ACTIVE` and fully public;
staff sees every status and requires auth. The codebase already has precedent for this exact shape:
`AuthController` + `StorefrontAuthController` live side-by-side in the same `auth` package. `Product`
gets the same treatment — `ProductController` and `StorefrontProductController` both in
`com.angkor.commerce.product`, both backed by the same `ProductService`.

---

## 1. Repositories

### `ProductRepository.java` (fill in the scaffold)

```java
package com.angkor.commerce.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

// JpaSpecificationExecutor gives findAll(Specification, Pageable) for free —
// see ProductSpecifications below for the composable optional-filter pieces.
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {}
```

### `ProductVariantRepository.java` (new)

```java
package com.angkor.commerce.product;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderBySizeAsc(Long productId);

    // Batch-load for a whole page of products in one query — see
    // ProductServiceImpl.hydrateSummaries, avoids an N+1 SELECT per product.
    List<ProductVariant> findByProductIdIn(Collection<Long> productIds);

    boolean existsBySku(String sku);
}
```

### `ProductImageRepository.java` (new)

```java
package com.angkor.commerce.product;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
}
```

### `CategoryRepository.java` — one addition

Storefront filters by `categorySlug`, not `categoryId` (per the endpoints doc). Need slug→entity resolution:

```java
// add to the existing interface
Optional<Category> findBySlug(String slug);
```

## 2. The filter helper — `ProductSpecifications.java` (new)

This is the "helper function" piece for combining optional filters (`categoryId`/`categorySlug`
resolved to ids, `search`, `minPrice`, `maxPrice`, `status`) without either a giant derived-method-name
explosion or a fragile hand-written `@Query` full of `:param IS NULL OR ...` branches. No new
dependency — `JpaSpecificationExecutor` ships with `spring-data-jpa`, already on the classpath.

```java
package com.angkor.commerce.product;

import com.angkor.commerce.common.enums.RecordStatus;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/** Composable WHERE-clause fragments for the product list/search filters. Each
 * returns null (no-op) when its filter wasn't supplied, so Specification.where(...)
 * .and(...) chains cleanly regardless of which filters are present. */
public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> hasStatus(RecordStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    // categoryIds is a list, not a single id: the storefront path expands a
    // parent category slug to itself + every descendant (mirrors
    // customer-portal's getDescendantCategoryIds), staff passes a singleton list.
    public static Specification<Product> inCategories(List<Long> categoryIds) {
        return (root, query, cb) ->
            categoryIds == null || categoryIds.isEmpty() ? null : root.get("category").get("id").in(categoryIds);
    }

    public static Specification<Product> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }

    public static Specification<Product> priceAtLeast(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null ? null : cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<Product> priceAtMost(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null ? null : cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }

    public static Specification<Product> combine(
        RecordStatus status,
        List<Long> categoryIds,
        String search,
        BigDecimal minPrice,
        BigDecimal maxPrice
    ) {
        return Specification.where(hasStatus(status))
            .and(inCategories(categoryIds))
            .and(matchesSearch(search))
            .and(priceAtLeast(minPrice))
            .and(priceAtMost(maxPrice));
    }
}
```

**Known tradeoff, worth stating explicitly**: `priceAtLeast`/`priceAtMost` filter against `Product.price`
(the base price), not the per-variant effective price (`priceOverride ?? price`) that `ProductResponse`
reports as `minPrice`/`maxPrice`. Filtering against the real effective-price range would need a join/subquery
against `product_variants` inside the `WHERE`, which starts fighting the pagination `COUNT` query. Base-price
filtering is the pragmatic MVP behavior — same simplification the mock frontend filter already makes today.
Revisit only if a product's variants start diverging meaningfully in price.

## 3. Category descendant expansion — addition to `CategoryService`

Storefront's `categorySlug` needs the same "match this category or anything beneath it in the tree"
behavior `customer-portal`'s `getDescendantCategoryIds` already does. Categories are the
"small, tree-shaped, unpaginated" exception per `CORE_API_ENDPOINTS.md` — loading all ~20-25 rows to
walk the tree in memory is exactly what that doc already assumes callers do.

```java
// CategoryService.java — add to the interface
List<Long> getDescendantCategoryIds(Long categoryId);
```

```java
// CategoryServiceImpl.java — add the implementation
@Override
@Transactional(readOnly = true)
public List<Long> getDescendantCategoryIds(Long categoryId) {
    Map<Long, List<Category>> byParent = categoryRepository
        .findAll()
        .stream()
        .filter((category) -> category.getParentId() != null)
        .collect(Collectors.groupingBy(Category::getParentId));

    List<Long> ids = new ArrayList<>();
    collectDescendants(categoryId, byParent, ids);
    return ids;
}

private void collectDescendants(Long categoryId, Map<Long, List<Category>> byParent, List<Long> acc) {
    acc.add(categoryId);
    for (Category child : byParent.getOrDefault(categoryId, List.of())) {
        collectDescendants(child.getId(), byParent, acc);
    }
}
```

## 4. Response DTOs

Same split as the customer-portal design: a light **summary** for list rows, a full **detail** with the
joined `variants`/`images` for the single-resource endpoint. No envelope on detail, per
`CORE_API_ENDPOINTS.md` ("Success responses — no generic envelope, return the resource/DTO directly").

### `dto/response/ProductResponse.java` (fill in the scaffold — this is the list/summary shape)

```java
package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.Product;
import com.angkor.commerce.product.ProductVariant;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public record ProductResponse(
    Long id,
    String name,
    String description,
    Long categoryId,
    String categoryName,
    BigDecimal price,
    String currency,
    BigDecimal discountPercentage,
    BigDecimal rating,
    String unit,
    String thumbnailUrl,
    RecordStatus status,
    boolean inStock,
    int totalStock,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    List<String> availableSizes,
    Instant createdAt,
    Instant updatedAt
) {
    // `category` is passed in explicitly rather than read off product.getCategory()
    // — see ProductServiceImpl.hydrateSummaries for why (N+1 avoidance on a list page).
    public static ProductResponse from(Product product, Category category, List<ProductVariant> variants) {
        List<BigDecimal> prices = variants
            .stream()
            .map((variant) -> variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getPrice())
            .toList();
        int totalStock = variants.stream().mapToInt(ProductVariant::getStock).sum();
        List<String> sizes = variants.stream().map(ProductVariant::getSize).filter(Objects::nonNull).toList();

        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            category.getId(),
            category.getName(),
            product.getPrice(),
            product.getCurrency(),
            product.getDiscountPercentage(),
            product.getRating(),
            product.getUnit(),
            product.getThumbnailUrl(),
            product.getStatus(),
            totalStock > 0,
            totalStock,
            prices.stream().min(Comparator.naturalOrder()).orElse(product.getPrice()),
            prices.stream().max(Comparator.naturalOrder()).orElse(product.getPrice()),
            sizes,
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}
```

### `dto/response/ProductVariantResponse.java` (new)

```java
package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.product.Product;
import com.angkor.commerce.product.ProductVariant;
import java.math.BigDecimal;

public record ProductVariantResponse(
    Long id,
    String size,
    String sku,
    Integer stock,
    BigDecimal priceOverride,
    BigDecimal effectivePrice
) {
    public static ProductVariantResponse from(ProductVariant variant, Product product) {
        BigDecimal effectivePrice =
            variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getPrice();
        return new ProductVariantResponse(
            variant.getId(),
            variant.getSize(),
            variant.getSku(),
            variant.getStock(),
            variant.getPriceOverride(),
            effectivePrice
        );
    }
}
```

### `dto/response/ProductImageResponse.java` (new)

```java
package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.product.ProductImage;

public record ProductImageResponse(Long id, String imageUrl, String thumbnailUrl, Integer displayOrder) {
    public static ProductImageResponse from(ProductImage image) {
        return new ProductImageResponse(
            image.getId(),
            image.getImageUrl(),
            image.getThumbnailUrl(),
            image.getDisplayOrder()
        );
    }
}
```

### `dto/response/ProductDetailResponse.java` (new — `GET /products/{id}`)

```java
package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.Product;
import com.angkor.commerce.product.ProductImage;
import com.angkor.commerce.product.ProductVariant;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductDetailResponse(
    Long id,
    String name,
    String description,
    Long categoryId,
    String categoryName,
    BigDecimal price,
    String currency,
    BigDecimal discountPercentage,
    BigDecimal rating,
    String unit,
    String thumbnailUrl,
    RecordStatus status,
    List<ProductVariantResponse> variants,
    List<ProductImageResponse> images,
    Instant createdAt,
    Instant updatedAt
) {   
    public static ProductDetailResponse from(
        Product product,
        List<ProductVariant> variants,
        List<ProductImage> images
    ) {

        return new ProductDetailResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getCategory().getId(),
            // Single-resource fetch — one lazy-load hit here is fine, unlike
            // the list endpoint's N+1 risk across a whole page of products.
            product
                .getCategory()
                .getName(),
            product.getPrice(),
            product.getCurrency(),
            product.getDiscountPercentage(),
            product.getRating(),
            product.getUnit(),
            product.getThumbnailUrl(),
            product.getStatus(),
            variants
                .stream()
                .map((variant) -> ProductVariantResponse.from(variant, product))
                .toList(),
            images.stream().map(ProductImageResponse::from).toList(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}
```

## 5. Request DTOs

### `dto/request/CreateProductRequest.java` (fill in the scaffold)

```java
package com.angkor.commerce.product.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateProductRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must be at most 200 characters")
    String name,

    String description,

    @NotNull(message = "Category is required") Long categoryId,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0", message = "Price must be zero or greater")
    BigDecimal price,

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code") String currency,

    @DecimalMin(value = "0", message = "Discount percentage must be zero or greater")
    @DecimalMax(value = "100", message = "Discount percentage must be at most 100")
    BigDecimal discountPercentage,

    String unit,
    String thumbnailUrl
) {}
```

### `dto/request/UpdateProductRequest.java` (fill in the scaffold)

PATCH-style, every field nullable/optional — same shape as `UpdateUserRequest`/`UpdateCategoryRequest`.

```java
package com.angkor.commerce.product.dto.request;

import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateProductRequest(
    @Size(max = 200, message = "Name must be at most 200 characters") String name,
    String description,
    Long categoryId,

    @DecimalMin(value = "0", message = "Price must be zero or greater") BigDecimal price,
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code") String currency,

    @DecimalMin(value = "0", message = "Discount percentage must be zero or greater")
    @DecimalMax(value = "100", message = "Discount percentage must be at most 100")
    BigDecimal discountPercentage,

    String unit,
    String thumbnailUrl,
    RecordStatus status
) {}
```

Variant/image management (`POST /products/{id}/variants`, reordering images, etc.) is a separate concern
from list/filter/detail — not designed here; flagging it exists so `CreateProductRequest` staying
product-only (no embedded variants array) is a deliberate scope cut, not an oversight.

## 6. Service

### `ProductService.java` (fill in the scaffold)

```java
package com.angkor.commerce.product;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.dto.request.CreateProductRequest;
import com.angkor.commerce.product.dto.request.UpdateProductRequest;
import com.angkor.commerce.product.dto.response.ProductDetailResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import java.math.BigDecimal;

public interface ProductService {
    // Staff: single categoryId, every status visible (status == null means "all").
    PageResponse<ProductResponse> listProducts(
        int skip,
        int limit,
        Long categoryId,
        String search,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        RecordStatus status
    );

    // Storefront: categorySlug expands to itself + descendants, always ACTIVE-only.
    PageResponse<ProductResponse> listStorefrontProducts(
        int skip,
        int limit,
        String categorySlug,
        String search,
        BigDecimal minPrice,
        BigDecimal maxPrice
    );

    ProductDetailResponse getProductById(Long id);

    // Storefront detail: 404s on a non-ACTIVE product too, not just a missing one
    // — a customer guessing an archived product's id shouldn't be able to view it.
    ProductDetailResponse getActiveProductById(Long id);

    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    ProductResponse archiveProduct(Long id);
}
```

### `impl/ProductServiceImpl.java` (fill in the scaffold)

```java
package com.angkor.commerce.product.impl;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.category.CategoryRepository;
import com.angkor.commerce.category.CategoryService;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.product.Product;
import com.angkor.commerce.product.ProductImage;
import com.angkor.commerce.product.ProductImageRepository;
import com.angkor.commerce.product.ProductRepository;
import com.angkor.commerce.product.ProductService;
import com.angkor.commerce.product.ProductSpecifications;
import com.angkor.commerce.product.ProductVariant;
import com.angkor.commerce.product.ProductVariantRepository;
import com.angkor.commerce.product.dto.request.CreateProductRequest;
import com.angkor.commerce.product.dto.request.UpdateProductRequest;
import com.angkor.commerce.product.dto.response.ProductDetailResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {

    private static final int DEFAULT_LIMIT = 30;

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    public ProductServiceImpl(
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository,
        ProductImageRepository productImageRepository,
        CategoryRepository categoryRepository,
        CategoryService categoryService
    ) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listProducts(
        int skip,
        int limit,
        Long categoryId,
        String search,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        RecordStatus status
    ) {
        List<Long> categoryIds = categoryId != null ? List.of(categoryId) : null;
        return listInternal(skip, limit, categoryIds, search, minPrice, maxPrice, status);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listStorefrontProducts(
        int skip,
        int limit,
        String categorySlug,
        String search,
        BigDecimal minPrice,
        BigDecimal maxPrice
    ) {
        List<Long> categoryIds = null;
        if (categorySlug != null && !categorySlug.isBlank()) {
            Category category = categoryRepository
                .findBySlug(categorySlug)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", categorySlug));
            categoryIds = categoryService.getDescendantCategoryIds(category.getId());
        }

        return listInternal(skip, limit, categoryIds, search, minPrice, maxPrice, RecordStatus.ACTIVE);
    }

    private PageResponse<ProductResponse> listInternal(
        int skip,
        int limit,
        List<Long> categoryIds,
        String search,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        RecordStatus status
    ) {
        int safeLimit = limit <= 0 ? DEFAULT_LIMIT : limit;
        int pageNumber = skip / safeLimit;
        Pageable pageable = PageRequest.of(pageNumber, safeLimit, Sort.by(Sort.Direction.ASC, "id"));

        Specification<Product> spec = ProductSpecifications.combine(status, categoryIds, search, minPrice, maxPrice);
        Page<Product> page = productRepository.findAll(spec, pageable);

        List<ProductResponse> items = hydrateSummaries(page.getContent());
        return new PageResponse<>(items, page.getTotalElements(), skip, safeLimit);
    }

    // Batch-loads variants AND categories for a whole page in two queries total
    // (not 2*N) — product.getCategory().getId() is safe on a lazy proxy (the FK
    // is embedded, no query fired), but .getName() is not, so categories are
    // hydrated the same way variants are rather than touched off the proxy.
    private List<ProductResponse> hydrateSummaries(List<Product> products) {
        if (products.isEmpty()) {
            return List.of();
        }

        List<Long> productIds = products.stream().map(Product::getId).toList();
        List<Long> categoryIds = products
            .stream()
            .map((product) -> product.getCategory().getId())
            .distinct()
            .toList();

        Map<Long, List<ProductVariant>> variantsByProduct = productVariantRepository
            .findByProductIdIn(productIds)
            .stream()
            .collect(Collectors.groupingBy((variant) -> variant.getProduct().getId()));

        Map<Long, Category> categoriesById = categoryRepository
            .findAllById(categoryIds)
            .stream()
            .collect(Collectors.toMap(Category::getId, (category) -> category));

        return products
            .stream()
            .map((product) ->
                ProductResponse.from(
                    product,
                    categoriesById.get(product.getCategory().getId()),
                    variantsByProduct.getOrDefault(product.getId(), List.of())
                )
            )
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(Long id) {
        return hydrateDetail(findProductOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getActiveProductById(Long id) {
        Product product = findProductOrThrow(id);
        if (product.getStatus() != RecordStatus.ACTIVE) {
            throw ResourceNotFoundException.of("Product", id);
        }
        return hydrateDetail(product);
    }

    private ProductDetailResponse hydrateDetail(Product product) {
        List<ProductVariant> variants = productVariantRepository.findByProductIdOrderBySizeAsc(product.getId());
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());
        return ProductDetailResponse.from(product, variants, images);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository
            .findById(request.categoryId())
            .orElseThrow(() -> ResourceNotFoundException.of("Category", request.categoryId()));

        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(category);
        product.setPrice(request.price());
        if (request.currency() != null) {
            product.setCurrency(request.currency());
        }
        if (request.discountPercentage() != null) {
            product.setDiscountPercentage(request.discountPercentage());
        }
        if (request.unit() != null) {
            product.setUnit(request.unit());
        }
        product.setThumbnailUrl(request.thumbnailUrl());
        product.setStatus(RecordStatus.ACTIVE);
        productRepository.save(product);

        // Every product needs >= 1 variant row (CORE_API_DATA_MODEL.md decision 9)
        // — a product with no size concept gets one implicit null-size row so
        // stock/sku are always readable from product_variants unconditionally.
        ProductVariant defaultVariant = new ProductVariant();
        defaultVariant.setProduct(product);
        defaultVariant.setSize(null);
        defaultVariant.setSku(generateSku(product, null));
        defaultVariant.setStock(0);
        productVariantRepository.save(defaultVariant);

        return ProductResponse.from(product, category, List.of(defaultVariant));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = findProductOrThrow(id);
        Category category = product.getCategory();

        if (request.categoryId() != null && !request.categoryId().equals(category.getId())) {
            category = categoryRepository
                .findById(request.categoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Category", request.categoryId()));
            product.setCategory(category);
        }
        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.currency() != null) {
            product.setCurrency(request.currency());
        }
        if (request.discountPercentage() != null) {
            product.setDiscountPercentage(request.discountPercentage());
        }
        if (request.unit() != null) {
            product.setUnit(request.unit());
        }
        if (request.thumbnailUrl() != null) {
            product.setThumbnailUrl(request.thumbnailUrl());
        }
        if (request.status() != null) {
            product.setStatus(request.status());
        }

        productRepository.save(product);
        List<ProductVariant> variants = productVariantRepository.findByProductIdOrderBySizeAsc(id);
        return ProductResponse.from(product, category, variants);
    }

    @Override
    @Transactional
    public ProductResponse archiveProduct(Long id) {
        Product product = findProductOrThrow(id);
        product.setStatus(RecordStatus.DELETED);
        productRepository.save(product);
        List<ProductVariant> variants = productVariantRepository.findByProductIdOrderBySizeAsc(id);
        return ProductResponse.from(product, product.getCategory(), variants);
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Product", id));
    }

    private String generateSku(Product product, String size) {
        String suffix = size != null ? "-" + size : "";
        return "SKU-" + product.getId() + suffix;
    }
}
```

## 7. Controllers

### `ProductController.java` (fill in the scaffold — staff, `/api/v1/products`)

```java
package com.angkor.commerce.product;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.dto.request.CreateProductRequest;
import com.angkor.commerce.product.dto.request.UpdateProductRequest;
import com.angkor.commerce.product.dto.response.ProductDetailResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.PRODUCTS_BASE)
public class ProductController {

    private static final int MAX_PAGE_LIMIT = 100;

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> list(
        @RequestParam(defaultValue = "0") int skip,
        @RequestParam(defaultValue = "30") int limit,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) RecordStatus status
    ) {
        int safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
        PageResponse<ProductResponse> result = productService.listProducts(
            skip,
            safeLimit,
            categoryId,
            search,
            minPrice,
            maxPrice,
            status
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_ADMIN')")
    public ResponseEntity<ProductResponse> create(@RequestBody @Valid CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.created(URI.create(ApiConstants.PRODUCTS_BASE + "/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_ADMIN')")
    public ResponseEntity<ProductResponse> update(
        @PathVariable Long id,
        @RequestBody @Valid UpdateProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SHOP_ADMIN')")
    public ResponseEntity<ProductResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(productService.archiveProduct(id));
    }
}
```

### `StorefrontProductController.java` (new — public, `/api/v1/storefront/products`)

```java
package com.angkor.commerce.product;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.product.dto.response.ProductDetailResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Public catalog read, no auth — see docs/CORE_API_ENDPOINTS.md. Query params
// intentionally mirror customer-portal's mock fetchProducts filter shape
// (categorySlug, query→search, minPrice/maxPrice) so this is a drop-in swap,
// not a redesign, on the frontend side.
@RestController
@RequestMapping(ApiConstants.STOREFRONT_PRODUCTS_BASE)
public class StorefrontProductController {

    private static final int MAX_PAGE_LIMIT = 100;

    private final ProductService productService;

    public StorefrontProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> list(
        @RequestParam(defaultValue = "0") int skip,
        @RequestParam(defaultValue = "20") int limit,
        @RequestParam(required = false) String categorySlug,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice
    ) {
        int safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
        PageResponse<ProductResponse> result = productService.listStorefrontProducts(
            skip,
            safeLimit,
            categorySlug,
            search,
            minPrice,
            maxPrice
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getActiveProductById(id));
    }
}
```

## 8. Wiring — `ApiConstants` and `SecurityConfig`

### `ApiConstants.java`

```java
public static final String PRODUCTS_BASE = API_BASE + "/products";

public static final String STOREFRONT_PRODUCTS_BASE = STOREFRONT_BASE + "/products";
```

### `SecurityConfig.java` — two new rules, same shape as the existing category block

Order matters: the storefront `permitAll` and the staff `GET`-only `.authenticated()` rule both need to
come _before_ the general staff wildcard `hasAnyRole` rule, since `authorizeHttpRequests` matches in
list order and the first match wins (exactly how the existing `CATEGORIES_BASE` block is ordered).

```java
.requestMatchers(HttpMethod.GET, ApiConstants.STOREFRONT_PRODUCTS_BASE, ApiConstants.STOREFRONT_PRODUCTS_BASE + "/**")
.permitAll()
.requestMatchers(HttpMethod.GET, ApiConstants.PRODUCTS_BASE, ApiConstants.PRODUCTS_BASE + "/**")
.authenticated() // any logged-in staff role can browse/view — matches the inventory/catalog nav
.requestMatchers(ApiConstants.PRODUCTS_BASE + "/**")
.hasAnyRole("SUPER_ADMIN", "SHOP_ADMIN") // create/update/archive stay admin-only
```

---

## Example requests/responses

```
GET /api/v1/storefront/products?categorySlug=women-sampot&skip=0&limit=20
```

```jsonc
{
    "items": [
        {
            "id": 25,
            "name": "Royal Silk Sampot",
            "description": "...",
            "categoryId": 12,
            "categoryName": "Sampot",
            "price": 68,
            "currency": "USD",
            "discountPercentage": 0,
            "rating": 4.9,
            "unit": "piece",
            "thumbnailUrl": "https://.../sampot-25-thumb.jpg",
            "status": "active",
            "inStock": true,
            "totalStock": 12,
            "minPrice": 68,
            "maxPrice": 72,
            "availableSizes": ["M", "L"],
            "createdAt": "2026-07-30T10:00:00Z",
            "updatedAt": "2026-07-30T10:00:00Z"
        }
    ],
    "total": 7,
    "skip": 0,
    "limit": 20
}
```

```
GET /api/v1/storefront/products/25
```

```jsonc
{
    "id": 25,
    "name": "Royal Silk Sampot",
    "description": "...",
    "categoryId": 12,
    "categoryName": "Sampot",
    "price": 68,
    "currency": "USD",
    "discountPercentage": 0,
    "rating": 4.9,
    "unit": "piece",
    "thumbnailUrl": "https://.../sampot-25-thumb.jpg",
    "status": "active",
    "variants": [
        { "id": 101, "size": "M", "sku": "SKU-25-M", "stock": 5, "priceOverride": null, "effectivePrice": 68 },
        { "id": 102, "size": "L", "sku": "SKU-25-L", "stock": 7, "priceOverride": 72, "effectivePrice": 72 }
    ],
    "images": [
        {
            "id": 201,
            "imageUrl": "https://.../sampot-25-1.jpg",
            "thumbnailUrl": "https://.../sampot-25-1-thumb.jpg",
            "displayOrder": 0
        }
    ],
    "createdAt": "2026-07-30T10:00:00Z",
    "updatedAt": "2026-07-30T10:00:00Z"
}
```

## Files touched — summary

**Fill in existing empty scaffolds**: `ProductController.java`, `ProductRepository.java`,
`ProductService.java`, `impl/ProductServiceImpl.java`, `dto/request/CreateProductRequest.java`,
`dto/request/UpdateProductRequest.java`, `dto/response/ProductResponse.java`.

**New files**: `ProductVariantRepository.java`, `ProductImageRepository.java`,
`ProductSpecifications.java`, `StorefrontProductController.java`,
`dto/response/ProductDetailResponse.java`, `dto/response/ProductVariantResponse.java`,
`dto/response/ProductImageResponse.java`.

**Small additions to existing files**: `CategoryRepository.findBySlug`,
`CategoryService`/`CategoryServiceImpl.getDescendantCategoryIds`, `ApiConstants` (2 constants),
`SecurityConfig` (2 matcher rules).

**Untouched**: `Product.java`, `ProductVariant.java`, `ProductImage.java` (entities already correct),
all migrations (schema already supports everything above — no new migration needed).
