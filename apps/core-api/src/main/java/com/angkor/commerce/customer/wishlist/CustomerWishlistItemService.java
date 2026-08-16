package com.angkor.commerce.customer.wishlist;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.customer.wishlist.dto.request.AddWishlistItemRequest;
import com.angkor.commerce.customer.wishlist.dto.response.WishlistItemResponse;
import java.util.List;

public interface CustomerWishlistItemService {
    // get as list
    PageResponse<WishlistItemResponse> getWishlistItems(Long customerId, int limit, int skip);
    /** The saved product ids only — what a grid needs to fill in its hearts. */
    List<Long> getWishlistProductIds(Long customerId);
    // add to wishlist
    WishlistItemResponse addWishlistItem(Long customerId, AddWishlistItemRequest addWishlistItemRequest);
    void removeItem(Long customerId, Long productId);
    void clear(Long customerId);
}
