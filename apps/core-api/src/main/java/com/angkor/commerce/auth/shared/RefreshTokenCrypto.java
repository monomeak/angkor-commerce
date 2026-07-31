package com.angkor.commerce.auth.shared;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Component;

/**
 * Mechanics shared by every refresh-token flow (staff, customer, ...): generate an
 * opaque random token and hash it for storage. Persistence and principal lookup stay
 * with each flow's own service/repository — this only knows about bytes and hashes.
 */
@Component
public class RefreshTokenCrypto {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String HASH_ALGORITHM = "SHA-256";

    public String generateRawToken() {
        byte[] bytes = new byte[64];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(HASH_ALGORITHM + " is not available", e);
        }
    }
}
