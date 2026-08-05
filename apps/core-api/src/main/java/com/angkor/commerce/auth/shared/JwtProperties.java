package com.angkor.commerce.auth.shared;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "angkor.jwt")
public record JwtProperties(long refreshTokenTtlDays, long accessTokenTtlMinutes, String secret) {}
