package com.angkor.commerce.common.storage;

import java.util.Collection;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    StoredImage upload(MultipartFile file, ImagePurpose purpose, Long entityId); // type-safe:

    // Pre-processed bytes (e.g. a generated thumbnail) that never came from a request. */
    StoredImage uploadBytes(byte[] content, String contentType, String extension, ImagePurpose purpose, Long entityId);
    void delet(String objectKey);
    String resolveUrl(String objectKey);
    /** Best-effort bulk delete — never throws, logs failures. */
    void deleteQuietly(Collection<String> objectKeys);
    boolean exists(String objectKey);
}
