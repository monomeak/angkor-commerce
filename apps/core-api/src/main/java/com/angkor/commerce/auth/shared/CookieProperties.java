package com.angkor.commerce.auth.shared;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "angkor.cookie")
public record CookieProperties(boolean secure, String sameSite) {}
