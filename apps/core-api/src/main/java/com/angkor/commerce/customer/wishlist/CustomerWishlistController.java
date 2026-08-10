package com.angkor.commerce.customer.wishlist;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.customer.wishlist.dto.request.AddWishlistItemRequest;
import com.angkor.commerce.customer.wishlist.dto.response.WishlistItemResponse;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedCustomer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.STOREFRONT_WISHLIST)
@RequiredArgsConstructor
@Tag(name = "Customers: wishlist")
public class CustomerWishlistController {

    private final CustomerWishlistItemService wishlistService;

    @GetMapping
    @Operation(summary = "List a customer's wishlist")
    public ResponseEntity<PageResponse<WishlistItemResponse>> getWishlist(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @RequestParam(defaultValue = "30") @Min(1) @Max(100) int limit,
        @RequestParam(defaultValue = "0") @Min(0) int skip
    ) {
        return ResponseEntity.ok(wishlistService.getWishlistItems(customer.id(), limit, skip));
    }

    @PostMapping
    @Operation(summary = "Add a product to a customer's wishlist (idempotent)")
    public ResponseEntity<WishlistItemResponse> addItem(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @RequestBody @Valid AddWishlistItemRequest request
    ) {
        WishlistItemResponse item = wishlistService.addWishlistItem(customer.id(), request);

        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a product from a customer's wishlist")
    public ResponseEntity<Void> removeItem(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @PathVariable Long productId
    ) {
        wishlistService.removeItem(customer.id(), productId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove all products from a customer's wishlist")
    public ResponseEntity<Void> clear(@AuthenticationPrincipal AuthenticatedCustomer customer) {
        wishlistService.clear(customer.id());

        return ResponseEntity.noContent().build();
    }
}
