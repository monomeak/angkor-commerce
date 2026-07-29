package com.angkor.commerce.auth.dto.response;

import com.angkor.commerce.user.Role;

public record AuthenticatedUserResponse(
    Long id,
    String username,
    String email,
    String firstName,
    String lastName,
    String image,
    Role role
) {}
