package com.acme.invoice.auth.dto.response;

import com.acme.invoice.common.enums.RecordStatus;
import com.acme.invoice.user.Role;

public record CurrentUserResponse(
    Long id,
    String firstName,
    String lastName,
    String username,
    String email,
    String phone,
    String image,
    Role role,
    RecordStatus status
) {}
