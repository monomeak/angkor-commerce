package com.angkor.commerce.category.dto.response;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.common.enums.RecordStatus;
import java.time.Instant;

public record CategoryResponse(
    Long id,
    Long parentId,
    String name,
    String slug,
    Integer sortOrder,
    RecordStatus recordStatus,
    Instant createdAt,
    Instant updatedAt
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getParentId(),
            category.getName(),
            category.getSlug(),
            category.getSortOrder(),
            category.getRecordStatus(),
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
}
