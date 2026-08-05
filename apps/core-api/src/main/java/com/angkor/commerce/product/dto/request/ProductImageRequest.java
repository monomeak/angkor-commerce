package com.angkor.commerce.product.dto.request;

// product/dto/request/ProductImageRequest.java

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ProductImageRequest(@NotBlank String imageUrl, String thumbnailUrl, @Min(0) Integer displayOrder) {}
