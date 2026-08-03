package com.angkor.commerce.common.storage;

/** Thrown when an uploaded file fails image validation (missing, too large, wrong type). Maps to HTTP 400. */
public class InvalidImageException extends RuntimeException {

    public InvalidImageException(String message) {
        super(message);
    }
}
