package com.acme.invoice.common.exception;

/**
 * Thrown for business-rule validation failures that go beyond simple bean
 * validation (e.g. "email already in use", "due date before issue date").
 * Maps to HTTP 400 with an optional field-level error map.
 */

import java.util.Map;

public class ValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public ValidationException(String message) {
        super(message);
        this.fieldErrors = Map.of();
    }

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
