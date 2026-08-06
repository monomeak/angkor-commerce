package com.angkor.commerce.product.port;

import java.util.Collection;
import java.util.List;

public interface ProductStockPort {
    VariantSnapshot getVariantSnapshot(Long variantId);
    /** IDs that do not exist are simply absent from the result. */
    List<VariantSnapshot> getVariantSnapshots(Collection<Long> variantIds);

    /**
     * Deducts stock. All-or-nothing: if any line is short, nothing
     * changes and InsufficientStockException names every offending SKU.
     */
    void reserveStock(List<StockChange> changes);

    /** Adds stock back, e.g. on cancellation. */
    void releaseStock(List<StockChange> changes);
}
