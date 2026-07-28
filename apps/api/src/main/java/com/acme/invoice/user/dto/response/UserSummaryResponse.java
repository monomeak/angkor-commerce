package com.acme.invoice.user.dto.response;

import com.acme.invoice.user.Role;

public record UserSummaryResponse(Long id, String firstName, String lastName, String email, String image, Role role) {}
