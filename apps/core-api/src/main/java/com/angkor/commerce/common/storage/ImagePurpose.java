package com.angkor.commerce.common.storage;

public enum ImagePurpose {
    STAFF_AVATAR("staff-users", "avatar"),
    CUSTOMER_AVATAR("customers", "avatar"),
    PRODUCT_MAIN("products", "main"),
    PRODUCT_THUMBNAIL("products", "thumbnail");

    private final String entityDirectory;
    private final String imageDirectory;

    ImagePurpose(String entityDirectory, String imageDirectory) {
        this.entityDirectory = entityDirectory;
        this.imageDirectory = imageDirectory;
    }

    public String entityDirectory() {
        return entityDirectory;
    }

    public String imageDirectory() {
        return imageDirectory;
    }
}
