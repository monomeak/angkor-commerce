package com.acme.invoice.auth.dto.response;

public record LoginResultResponse(AuthenticatedUserResponse user, String accessToken, String refreshToken) {}
