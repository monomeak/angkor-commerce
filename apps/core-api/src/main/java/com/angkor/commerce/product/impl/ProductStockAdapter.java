package com.angkor.commerce.product.impl;

import static java.util.stream.Collectors.toMap;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.common.exception.InsufficientStockException;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.product.entities.Product;
import com.angkor.commerce.product.entities.ProductVariant;
import com.angkor.commerce.product.port.ProductStockPort;
import com.angkor.commerce.product.port.StockChange;
import com.angkor.commerce.product.port.VariantSnapshot;
import com.angkor.commerce.product.repositories.ProductVariantRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductStockAdapter implements ProductStockPort {

    private final ProductVariantRepository productVariantRepository;

    @Override
    public VariantSnapshot getVariantSnapshot(Long variantId) {
        return getVariantSnapshots(List.of(variantId))
            .stream()
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Product variant " + variantId + " was not found"));
    }

    @Override
    public List<VariantSnapshot> getVariantSnapshots(Collection<Long> variantIds) {
        if (variantIds.isEmpty()) {
            // return empty list
            return List.of();
        }
        return productVariantRepository
            .findAllWithProductByIdIn(Set.copyOf(variantIds))
            .stream()
            .map(this::toSnapshot)
            .toList();
    }

    @Override
    @Transactional
    public void reserveStock(List<StockChange> changes) {
        applyStockChanges(changes, true);
    }

    @Override
    @Transactional
    public void releaseStock(List<StockChange> changes) {
        applyStockChanges(changes, false);
    }

    public void applyStockChanges(List<StockChange> changes, boolean deduct) {
        if (changes.isEmpty()) {
            return;
        }

        // The same variant can appear on two lines of one order.
        // Merge so we lock and check each row exactly once.
        // HACK ;)

        Map<Long, Integer> merged = changes
            .stream()
            .collect(Collectors.toMap(StockChange::variantId, StockChange::quantity, Integer::sum));
        List<Long> ids = merged.keySet().stream().sorted().toList();
        List<ProductVariant> variants = productVariantRepository.lockAllByIdIn(ids);

        if (variants.size() != ids.size()) {
            Set<Long> found = variants.stream().map(ProductVariant::getId).collect(Collectors.toSet());

            List<Long> missing = ids
                .stream()
                .filter(id -> !found.contains(id))
                .toList();

            throw new ResourceNotFoundException("Product variants not found: " + missing);
        }

        // ── Validate EVERYTHING before changing ANYTHING ──
        // Otherwise a shortfall on line 4 leaves lines 1-3 deducted.
        if (deduct) {
            List<String> shortfalls = variants
                .stream()
                .filter(v -> v.getStock() < merged.get(v.getId()))
                .map(v -> "%s (wanted %d, have %d)".formatted(v.getSku(), merged.get(v.getId()), v.getStock()))
                .toList();

            if (!shortfalls.isEmpty()) {
                throw new InsufficientStockException("Not enough stock for: " + String.join("; ", shortfalls));
            }

            variants.forEach(v -> {
                int delta = merged.get(v.getId());
                v.setStock(deduct ? v.getStock() - delta : v.getStock() + delta);
            });
        }
    }

    // helper function
    private VariantSnapshot toSnapshot(ProductVariant v) {
        Product p = v.getProduct();

        return new VariantSnapshot(
            v.getId(),
            p.getId(),
            p.getName(),
            v.getSize(),
            v.getSku(),
            p.getThumbnailUrl(),
            v.getPriceOverride() != null ? v.getPriceOverride() : p.getPrice(),
            p.getCurrency(),
            p.getUnit(),
            v.getStock(),
            p.getStatus() == RecordStatus.ACTIVE
        );
    }
}
