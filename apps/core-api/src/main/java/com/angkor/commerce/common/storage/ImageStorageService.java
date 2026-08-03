package com.angkor.commerce.common.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    StoredImage upload(MultipartFile file, ImagePurpose purpose, Long entityId); // type-safe:
    void delet(String objectKey);
    String resolveUrl(String objectKey);
}
