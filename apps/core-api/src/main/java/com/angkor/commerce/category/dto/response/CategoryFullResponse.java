package com.angkor.commerce.category.dto.response;

import com.angkor.commerce.category.Category;
import java.time.Instant;

public record CategoryFullResponse(
    Long id,
    Long parentId,
    String name,
    String slug,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {
    public static CategoryFullResponse from(Category category) {
        return new CategoryFullResponse(
            category.getId(),
            category.getParentId(),
            category.getName(),
            category.getSlug(),
            category.getSortOrder(),
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
}
