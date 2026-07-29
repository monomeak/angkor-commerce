package com.angkor.commerce.auth.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.user.Role;

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
