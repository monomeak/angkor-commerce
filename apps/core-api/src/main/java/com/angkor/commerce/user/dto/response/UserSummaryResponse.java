package com.angkor.commerce.user.dto.response;

import com.angkor.commerce.user.Role;

public record UserSummaryResponse(Long id, String firstName, String lastName, String email, String image, Role role) {}
