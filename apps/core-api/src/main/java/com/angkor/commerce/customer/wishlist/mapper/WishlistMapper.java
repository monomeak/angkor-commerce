package com.angkor.commerce.customer.wishlist.mapper;

import com.angkor.commerce.customer.wishlist.CustomerWishlistItem;
import com.angkor.commerce.customer.wishlist.dto.response.WishlistItemResponse;
import com.angkor.commerce.product.entities.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WishlistMapper {

    public WishlistItemResponse toResponse(CustomerWishlistItem item) {
        Product product = item.getProduct(); // load full product.
        return new WishlistItemResponse(
            item.getId(),
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getThumbnailUrl(),
            product.getPrice(),
            product.getCurrency(),
            product.getStatus(),
            item.getCreatedAt()
        );
    }
}
