package com.acme.invoice.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    int status,
    String error,
    String message,
    String path,
    OffsetDateTime timestamp,
    Map<String, String> errors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, OffsetDateTime.now(), null);
    }

    public static ErrorResponse ofValidation(
        int status,
        String error,
        String message,
        String path,
        Map<String, String> errors
    ) {
        return new ErrorResponse(status, error, message, path, OffsetDateTime.now(), errors);
    }
}
