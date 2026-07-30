package com.angkor.commerce.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
    Long parentId,

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    String name,

    @NotBlank(message = "Slug is required")
    @Size(max = 160, message = "Slug must be at most 160 characters")
    @Pattern(
        regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        message = "Slug must be lowercase, alphanumeric, and hyphen-separated"
    )
    String slug,

    Integer sortOrder
) {}
