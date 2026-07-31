package com.angkor.commerce.auth.shared;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Builds/clears the httpOnly access+refresh cookie pair for any login flow (staff,
 * customer, ...). Cookie names are caller-supplied so each flow can keep its cookies
 * distinct (staff and customer sessions share one API origin, so identically-named
 * cookies would silently overwrite each other in the browser's cookie jar).
 */
@Component
public class AuthCookieService {

    private final boolean cookieSecure;
    private final String cookieSameSite;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;

    public AuthCookieService(
        @Value("${angkor.cookie.secure}") boolean cookieSecure,
        @Value("${angkor.cookie.same-site}") String cookieSameSite,
        @Value("${angkor.jwt.access-token-ttl-minutes}") long accessTokenTtlMinutes,
        @Value("${angkor.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
        this.accessTokenTtl = Duration.ofMinutes(accessTokenTtlMinutes);
        this.refreshTokenTtl = Duration.ofDays(refreshTokenTtlDays);
    }

    public void setAuthCookies(
        HttpServletResponse response,
        String accessCookieName,
        String accessToken,
        String refreshCookieName,
        String refreshToken
    ) {
        response.addHeader(
            HttpHeaders.SET_COOKIE,
            buildCookie(accessCookieName, accessToken, accessTokenTtl).toString()
        );
        response.addHeader(
            HttpHeaders.SET_COOKIE,
            buildCookie(refreshCookieName, refreshToken, refreshTokenTtl).toString()
        );
    }

    public void clearAuthCookies(HttpServletResponse response, String accessCookieName, String refreshCookieName) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(accessCookieName, "", Duration.ZERO).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(refreshCookieName, "", Duration.ZERO).toString());
    }

    private ResponseCookie buildCookie(String name, String value, Duration maxAge) {
        return ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(maxAge)
            .build();
    }
}
