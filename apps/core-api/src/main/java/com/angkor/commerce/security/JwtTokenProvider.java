package com.angkor.commerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Issues and validates short-lived JWT access tokens.
 * Refresh tokens are opaque, random strings persisted (hashed) in {@code refresh_tokens};
 * this class only handles the signed access token used on each request.
 */
@Component
public class JwtTokenProvider {

    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_ROLE = "role";

    private final SecretKey signingKey;
    private final long accessTokenTtlMinutes;

    public long getAccessTokenTtlMinutes() {
        return accessTokenTtlMinutes;
    }

    public JwtTokenProvider(
        @Value("${angkor.jwt.secret}") String secret,
        @Value("${angkor.jwt.access-token-ttl-minutes}") long accessTokenTtlMinutes
    ) {
        this.signingKey = resolveKey(secret);
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
    }

    private static SecretKey resolveKey(String secret) {
        byte[] bytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        // HS256 needs >= 256 bits (32 bytes). Development default is padded/checked at startup.
        if (bytes.length < 32) {
            throw new IllegalStateException("angkor.jwt.secret must be at least 32 bytes long for HS256");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generateAccessToken(Long userId, String username, String role) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
            .subject(username)
            .claim(CLAIM_USER_ID, userId)
            .claim(CLAIM_ROLE, role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(signingKey)
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public Long getUserId(String token) {
        return parseClaims(token).get(CLAIM_USER_ID, Long.class);
    }

    public String getUserRole(String token) {
        return parseClaims(token).get(CLAIM_ROLE, String.class);
    }

    public long getAccessTokenTtlMininutes() {
        return accessTokenTtlMinutes;
    }
}
