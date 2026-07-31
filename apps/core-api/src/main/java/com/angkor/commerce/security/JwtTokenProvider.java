package com.angkor.commerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Issues and validates short-lived JWT access tokens for both principal types (staff
 * and customer) — same signing key and TTL, different claim shapes. Staff tokens carry
 * a {@code role} claim; customer tokens deliberately don't, since customers don't get a
 * {@code Role} value (see CORE_API_DATA_MODEL.md decision 7 — role claims are a staff
 * permission concept, customer access is ownership-based, not role-based).
 * Refresh tokens are opaque, random strings persisted (hashed) in {@code refresh_tokens} /
 * {@code customer_refresh_tokens}; this class only handles the signed access token.
 */
@Component
public class JwtTokenProvider {

    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_PRINCIPAL_TYPE = "typ";
    private static final String PRINCIPAL_TYPE_STAFF = "staff";
    private static final String PRINCIPAL_TYPE_CUSTOMER = "customer";

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
        return buildToken(userId, username, PRINCIPAL_TYPE_STAFF, Map.of(CLAIM_ROLE, role));
    }

    public String generateCustomerAccessToken(Long customerId, String email) {
        return buildToken(customerId, email, PRINCIPAL_TYPE_CUSTOMER, Map.of());
    }

    private String buildToken(Long subjectId, String subject, String principalType, Map<String, Object> extraClaims) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES);

        JwtBuilder builder = Jwts.builder()
            .subject(subject)
            .claim(CLAIM_USER_ID, subjectId)
            .claim(CLAIM_PRINCIPAL_TYPE, principalType)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry));

        extraClaims.forEach(builder::claim);

        return builder.signWith(signingKey).compact();
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

    public boolean isCustomerToken(String token) {
        return PRINCIPAL_TYPE_CUSTOMER.equals(parseClaims(token).get(CLAIM_PRINCIPAL_TYPE, String.class));
    }

    public long getAccessTokenTtlMininutes() {
        return accessTokenTtlMinutes;
    }
}
