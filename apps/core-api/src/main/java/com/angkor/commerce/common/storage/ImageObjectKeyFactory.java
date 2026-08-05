package com.angkor.commerce.common.storage;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ImageObjectKeyFactory {

    public String create(ImagePurpose purpose, Long entityId, String extension) {
        if (entityId == null || entityId <= 0) {
            throw new IllegalArgumentException("Entity ID must be a positive number");
        }
        return "%s/%d/%s/%s.%s".formatted(
            purpose.entityDirectory(),
            entityId,
            purpose.imageDirectory(),
            UUID.randomUUID(),
            extension
        );
    }
}
