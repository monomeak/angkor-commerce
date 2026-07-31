package com.angkor.commerce.auth.dto.response;

public record AuthenticatedCustomerResponse(
    Long id,
    String displayName,
    String firstName,
    String lastName,
    String companyName,
    String email,
    String phone
) {}
