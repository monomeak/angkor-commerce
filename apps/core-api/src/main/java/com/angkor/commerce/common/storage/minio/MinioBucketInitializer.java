package com.angkor.commerce.common.storage.minio;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class MinioBucketInitializer implements ApplicationRunner {

    private final MinioClient minioClient;
    private final MinioProperties properties;

    public MinioBucketInitializer(MinioClient minioClient, MinioProperties properties) {
        this.minioClient = minioClient;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(properties.bucket()).build());
        if (!bucketExists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(properties.bucket()).build());
        }
    }
}
