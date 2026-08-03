package com.angkor.commerce.auth.dto.request;

import com.angkor.commerce.auth.dto.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterCustomerRequest(
    @NotBlank(message = "First name is required") String firstName,
    @NotBlank(message = "Last name is required") String lastName,
    @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
    @NotBlank(message = "Password is required") @StrongPassword() String password
) {}
