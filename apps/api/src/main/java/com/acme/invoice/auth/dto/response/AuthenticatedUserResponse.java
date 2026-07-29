package com.acme.invoice.auth.dto.response;

import com.acme.invoice.user.Role;

public record AuthenticatedUserResponse(
    Long id,
    String username,
    String email,
    String firstName,
    String lastName,
    String image,
    Role role
) {}
