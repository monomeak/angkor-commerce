package com.angkor.commerce.common.storage;

/** Thrown when the underlying object storage fails to store/retrieve/delete an image. Maps to HTTP 502. */
public class ImageStorageException extends RuntimeException {

    public ImageStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
