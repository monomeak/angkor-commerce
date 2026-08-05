package com.angkor.commerce.common.storage;

import com.google.common.collect.Sets;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class ImageValidator {

    private final ImageProperties imageProperties;

    // get through function avoid compile error
    private long maxImageSizeBytes() {
        return imageProperties.maxFileSize().toBytes();
    }

    private Set<String> allowedTypes() {
        return imageProperties.allowedTypes();
    }

    private Map<String, String> allowedExtensions() {
        return imageProperties.extensions();
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("Image is required");
        }
        if (file.getSize() > maxImageSizeBytes()) {
            throw new InvalidImageException("mage must not exceed" + maxImageSizeBytes() + " MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes().contains(contentType)) {
            throw new InvalidImageException("Only JPEG, PNG, and WebP images are allowed");
        }
    }

    public String getExtension(MultipartFile file) {
        String extension = allowedExtensions().get(file.getContentType());
        if (extension == null) {
            throw new InvalidImageException("Unsupported Image type");
        }
        return extension;
    }
}
