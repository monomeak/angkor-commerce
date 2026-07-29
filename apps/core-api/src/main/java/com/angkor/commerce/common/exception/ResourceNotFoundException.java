package com.angkor.commerce.common.exception;

/** Thrown when a requested resource does not exist. Maps to HTTP 404. */

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String resourceName, Object identifier) {
        return new ResourceNotFoundException(resourceName + " with id " + identifier + "was not found");
    }
}
