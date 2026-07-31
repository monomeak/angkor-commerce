package com.angkor.commerce.auth.dto.response;

public record CustomerLoginResultResponse(
    AuthenticatedCustomerResponse customer,
    String accessToken,
    String refreshToken
) {}
