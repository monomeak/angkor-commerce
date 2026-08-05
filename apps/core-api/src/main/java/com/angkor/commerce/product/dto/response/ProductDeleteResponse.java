package com.angkor.commerce.product.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import java.time.Instant;

public record ProductDeleteResponse(
    Long id,
    String name,
//    String sku, // primary variant's, or null for multi-variant
    RecordStatus status,
    boolean isDeleted,
    Instant deletedOn
) {

}
