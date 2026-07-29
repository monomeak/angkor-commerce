package com.angkor.commerce.user.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.user.Role;
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
