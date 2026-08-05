package com.angkor.commerce.common.storage.minio;

import com.angkor.commerce.common.storage.ImageObjectKeyFactory;
import com.angkor.commerce.common.storage.ImageStorageService;
import com.angkor.commerce.common.storage.ImageValidator;
import io.minio.MinioClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MinioProperties.class)
public class MinioConfig {

    @Bean
    public MinioClient minioClient(MinioProperties properties) {
        return MinioClient.builder()
            .endpoint(properties.endpoint())
            .credentials(properties.accessKey(), properties.secretKey())
            .build();
    }

    @Bean
    public ImageStorageService imageStorageService(
        MinioClient minioClient,
        MinioProperties properties,
        ImageValidator validator,
        ImageObjectKeyFactory keyFactory
    ) {
        return new MinioImageStorageService(minioClient, properties, validator, keyFactory);
    }
}
