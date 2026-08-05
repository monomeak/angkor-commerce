package com.angkor.commerce.common.storage.minio;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "angkor.storage.minio")
public record MinioProperties(
    String endpoint,
    String publicBaseUrl,
    String accessKey,
    String secretKey,
    String bucket
) {
    public String normalizedBucket() {
        return bucket.trim();
    }
}
