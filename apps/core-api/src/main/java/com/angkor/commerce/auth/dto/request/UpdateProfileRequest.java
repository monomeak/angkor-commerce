package com.angkor.commerce.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/** Self-service profile update. Deliberately has no {@code role} or {@code status} field. */
public record UpdateProfileRequest(
    @Size(max = 100, message = "First name must be at most 100 characters") String firstName,
    @Size(max = 100, message = "Last name must be at most 100 characters") String lastName,
    @Email(message = "Email must be a valid email address") String email,
    String phone,
    String image
) {}
