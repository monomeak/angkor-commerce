package com.angkor.commerce.common.storage;

import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ImageValidator {

    private static final long MAX_IMAGE_SIZE = 5L * 1024 * 1024; //  load from env later
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Map<String, String> EXTENSTIONS = Map.of(
        "image/jpeg",
        "jpg",
        "image/png",
        "png",
        "image/webp",
        "webp"
    );

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("Image is required");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new InvalidImageException("mage must not exceed" + MAX_IMAGE_SIZE + " MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new InvalidImageException("Only JPEG, PNG, and WebP images are allowed");
        }
    }

    public String getExtension(MultipartFile file) {
        String extension = EXTENSTIONS.get(file.getContentType());
        if (extension == null) {
            throw new InvalidImageException("Unsupported Image type");
        }
        return extension;
    }
}
