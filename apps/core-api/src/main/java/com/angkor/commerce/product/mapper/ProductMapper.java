package com.angkor.commerce.product.mapper;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.category.dto.response.CategoryResponse;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.product.dto.request.CreateProductRequest;
import com.angkor.commerce.product.dto.response.ProductAggregate;
import com.angkor.commerce.product.dto.response.ProductImageResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import com.angkor.commerce.product.dto.response.ProductSummaryResponse;
import com.angkor.commerce.product.dto.response.ProductVariantResponse;
import com.angkor.commerce.product.entities.Product;
import com.angkor.commerce.product.entities.ProductImage;
import com.angkor.commerce.product.entities.ProductVariant;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    // ── Product ───────────────────────────────────────────────
    public ProductResponse toResponse(Product product, List<ProductVariant> variants, List<ProductImage> images) {
        List<ProductVariantResponse> variantResponses = variants
            .stream()
            .map(v -> toVariantResponse(v, product))
            .toList();
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            toCategoryResponse(product.getCategory()),
            product.getPrice(),
            product.getCurrency(),
            product.getDiscountPercentage(),
            product.getRating(),
            product.getUnit(),
            product.getStatus(),
            product.getThumbnailUrl(),
            images.stream().map(this::toImageResponse).toList(),
            variantResponses,
            totalStock(variants),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }

    // Mapper struct can be used
    public ProductSummaryResponse toSummary(Product product, ProductAggregate aggregate) {
        return new ProductSummaryResponse(
            product.getId(),
            product.getName(),
            categoryName(product.getCategory()),
            minPrice(product, aggregate),
            product.getCurrency(),
            product.getDiscountPercentage(),
            product.getRating(),
            aggregate != null ? aggregate.getTotalStock() : 0,
            aggregate != null ? aggregate.getVariantCount() : 0,
            product.getThumbnailUrl(),
            product.getStatus()
        );
    }

    // ── Variant ───────────────────────────────────────────────

    public ProductVariantResponse toVariantResponse(ProductVariant variant, Product product) {
        return new ProductVariantResponse(
            variant.getId(),
            variant.getSize(),
            variant.getSku(),
            variant.getStock(),
            effectivePrice(variant, product),
            variant.getPriceOverride()
        );
    }

    // ── Image ─────────────────────────────────────────────────

    public ProductImageResponse toImageResponse(ProductImage image) {
        return new ProductImageResponse(
            image.getId(),
            image.getImageUrl(),
            image.getThumbnailUrl(),
            image.getDisplayOrder()
        );
    }

    // ── Category ──────────────────────────────────────────────

    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug());
    }

    // ── Computed values ───────────────────────────────────────

    /** Variant price when overridden, otherwise the product's base price. */
    private BigDecimal effectivePrice(ProductVariant variant, Product product) {
        return variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getPrice();
    }

    private int totalStock(List<ProductVariant> variants) {
        return variants
            .stream()
            .mapToInt(v -> v.getStock() == null ? 0 : v.getStock())
            .sum();
    }

    /** Lowest effective price across variants — drives "from ៛48,000" in list views. */
    private BigDecimal minPrice(Product product, ProductAggregate aggregate) {
        return aggregate != null && aggregate.getMinPrice() != null ? aggregate.getMinPrice() : product.getPrice();
    }

    private String categoryName(Category category) {
        return category != null ? category.getName() : null;
    }

    public Product toEntity(CreateProductRequest request, Category category, String defaultCurrency) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(category);
        product.setPrice(request.price());
        product.setCurrency(defaultIfNull(request.currency(), defaultCurrency));
        product.setDiscountPercentage(defaultIfNull(request.discountPercentage(), BigDecimal.ZERO));
        product.setUnit(defaultIfNull(request.unit(), "piece"));
        product.setThumbnailUrl(request.thumbnailUrl());
        product.setStatus(RecordStatus.ACTIVE);
        return product;
    }

    public static <T> T defaultIfNull(T value, T defaultValue) {
        return value != null ? value : defaultValue;
    }
}
