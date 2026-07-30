package com.angkor.commerce.category.dto.request;

import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
    Long parentId,

    @Size(max = 150, message = "Name must be at most 150 characters")
    String name,

    @Size(max = 160, message = "Slug must be at most 160 characters")
    @Pattern(
        regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        message = "Slug must be lowercase, alphanumeric, and hyphen-separated"
    )
    String slug,

    Integer sortOrder,

    RecordStatus recordStatus
) {}
