package com.acme.invoice.user.dto.request;

import com.acme.invoice.common.enums.RecordStatus;
import com.acme.invoice.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(max = 100, message = "First name must be at most 100 characters") String firstName,
    @Size(max = 100, message = "Last name must be at most 100 characters") String lastName,
    @Email(message = "Email must be a valid email address") String email,

    String phone,
    String image,
    Role role,
    RecordStatus status
) {}
