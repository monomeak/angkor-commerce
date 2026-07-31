package com.angkor.commerce.auth.dto.response;

public record LoginResultResponse(AuthenticatedUserResponse user, String accessToken, String refreshToken) {}
