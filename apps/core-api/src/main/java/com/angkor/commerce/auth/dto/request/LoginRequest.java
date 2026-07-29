package com.angkor.commerce.auth.dto.request;

/** {@code username} may be either the username or the email, mirroring DummyJSON-style login. */

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Username is required") String username,
    @NotBlank(message = "Password is required") String password
) {}
