package com.angkor.commerce.customer.wishlist.mapper;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.customer.wishlist.CustomerWishlistItem;
import com.angkor.commerce.customer.wishlist.dto.response.WishlistItemResponse;
import com.angkor.commerce.product.dto.response.ProductAggregate;
import com.angkor.commerce.product.entities.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WishlistMapper {

    /**
     * @param aggregate the product's variant totals, or null when it has no variants — the
     *                  same fallback {@code ProductMapper} applies to a list row.
     */
    public WishlistItemResponse toResponse(CustomerWishlistItem item, ProductAggregate aggregate) {
        Product product = item.getProduct(); // load full product.
        Category category = product.getCategory();

        return new WishlistItemResponse(
            item.getId(),
            product.getId(),
            product.getName(),
            product.getDescription(),
            category != null ? category.getSlug() : null,
            product.getThumbnailUrl(),
            aggregate != null && aggregate.getMinPrice() != null ? aggregate.getMinPrice() : product.getPrice(),
            product.getCurrency(),
            product.getDiscountPercentage(),
            aggregate != null ? aggregate.getTotalStock() : 0,
            product.getStatus(),
            item.getCreatedAt()
        );
    }
}
