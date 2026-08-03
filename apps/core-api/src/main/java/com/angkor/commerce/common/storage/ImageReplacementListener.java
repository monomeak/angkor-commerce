package com.angkor.commerce.common.storage;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.StringUtils;

@Component
public class ImageReplacementListener {

    private final ImageStorageService imageStorageService;

    public ImageReplacementListener(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void deleteOldImage(ImageReplacedEvent event) {
        if (StringUtils.hasText(event.oldObjectKey())) {
            imageStorageService.delet(event.oldObjectKey());
        }
    }
}
