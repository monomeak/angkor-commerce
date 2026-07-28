package com.acme.invoice.user.dto.response;

import com.acme.invoice.common.enums.RecordStatus;
import com.acme.invoice.user.Role;
import java.time.Instant;

public record UserResponse(
    Long id,
    String firstName,
    String lastName,
    String username,
    String email,
    String phone,
    String image,
    Role role,
    RecordStatus status,
    Instant createdAt,
    Instant updatedAt
) {}
