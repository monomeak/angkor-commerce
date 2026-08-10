package com.angkor.commerce.common.storage;

import java.util.Map;
import java.util.Set;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@ConfigurationProperties(prefix = "angkor.image")
public record ImageProperties(
    int maxWidth,
    int maxHeight,
    double quality,
    DataSize maxFileSize,
    int maxPerProduct,
    Set<String> allowedTypes,
    Map<String, String> extensions
) {}
