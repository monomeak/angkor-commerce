package com.angkor.commerce.customer.wishlist.impl;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;

import com.angkor.commerce.common.CollectionKeys;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.exception.ResourceAlreadyExistsException;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.customer.wishlist.CustomerWishlistItem;
import com.angkor.commerce.customer.wishlist.CustomerWishlistItemRepository;
import com.angkor.commerce.customer.wishlist.CustomerWishlistItemService;
import com.angkor.commerce.customer.wishlist.dto.request.AddWishlistItemRequest;
import com.angkor.commerce.customer.wishlist.dto.response.WishlistItemResponse;
import com.angkor.commerce.customer.wishlist.mapper.WishlistMapper;
import com.angkor.commerce.product.dto.response.ProductAggregate;
import com.angkor.commerce.product.entities.Product;
import com.angkor.commerce.product.repositories.ProductRepository;
import com.angkor.commerce.product.repositories.ProductVariantRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements CustomerWishlistItemService {

    private final CustomerWishlistItemRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final WishlistMapper wishlistMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WishlistItemResponse> getWishlistItems(Long customerId, int limit, int skip) {
        Pageable pageable = PageRequest.of(skip / limit, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<CustomerWishlistItem> page = wishlistRepository.findByCustomerId(customerId, pageable);

        // One aggregate query for the whole page, the same way ProductServiceImpl builds its
        // list rows — asking per item would put the N+1 back that the entity graph removed.
        Map<Long, ProductAggregate> aggregates = aggregatesFor(
            page
                .getContent()
                .stream()
                .map(item -> item.getProduct().getId())
                .toList()
        );

        List<WishlistItemResponse> items = page
            .getContent()
            .stream()
            .map(item -> wishlistMapper.toResponse(item, aggregates.get(item.getProduct().getId())))
            .toList();

        return PageResponse.of(CollectionKeys.WISHLIST, items, page.getTotalElements(), skip, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getWishlistProductIds(Long customerId) {
        return wishlistRepository.findProductIdsByCustomerId(customerId);
    }

    @Override
    @Transactional
    public WishlistItemResponse addWishlistItem(Long customerId, AddWishlistItemRequest request) {
        // save
        Product product = productRepository
            .findById(request.productId())
            .orElseThrow(() ->
                new ResourceNotFoundException("Product with ID: " + request.productId() + " was not found")
            );

        Optional<CustomerWishlistItem> existing = wishlistRepository.findByCustomerIdAndProductId(
            customerId,
            request.productId()
        );

        if (existing.isPresent()) {
            throw new ResourceAlreadyExistsException("Resource already exisit.");
        }

        CustomerWishlistItem wishlistItem = new CustomerWishlistItem();
        wishlistItem.setCustomer(customerRepository.getReferenceById(customerId));
        wishlistItem.setProduct(product);

        CustomerWishlistItem saved = wishlistRepository.save(wishlistItem);

        return wishlistMapper.toResponse(saved, aggregatesFor(List.of(product.getId())).get(product.getId()));
    }

    @Override
    @Transactional
    public void removeItem(Long customerId, Long productId) {
        long removed = wishlistRepository.deleteByCustomerIdAndProductId(customerId, productId);
        if (removed == 0) {
            throw new ResourceNotFoundException("Product with ID " + productId + " is not on the wishlist");
        }
    }

    @Override
    @Transactional
    public void clear(Long customerId) {
        wishlistRepository.deleteAllByCustomerId(customerId);
    }

    /** Variant totals keyed by product id. Empty for an empty page — {@code in ()} is not valid SQL. */
    private Map<Long, ProductAggregate> aggregatesFor(Collection<Long> productIds) {
        if (productIds.isEmpty()) {
            return Map.of();
        }

        return variantRepository
            .aggragateByProductIds(productIds)
            .stream()
            .collect(toMap(ProductAggregate::getProductId, identity()));
    }
}
