package com.angkor.commerce.auth.impl;

import com.angkor.commerce.auth.AuthService;
import com.angkor.commerce.auth.RefreshToken;
import com.angkor.commerce.auth.RefreshTokenRepository;
import com.angkor.commerce.auth.dto.request.LoginRequest;
import com.angkor.commerce.auth.dto.request.RefreshRequest;
import com.angkor.commerce.auth.dto.response.AuthenticatedUserResponse;
import com.angkor.commerce.auth.dto.response.CurrentUserResponse;
import com.angkor.commerce.auth.dto.response.LoginResultResponse;
import com.angkor.commerce.auth.dto.response.LoginResultResponse;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.security.JwtTokenProvider;
import com.angkor.commerce.user.User;
import com.angkor.commerce.user.UserRepository;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String HASH_ALGORITHM = "SHA-256";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final long refreshTokenTtlDays;

    public AuthServiceImpl(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        JwtTokenProvider jwtTokenProvider,
        @Value("${angkor.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    @Override
    @Transactional
    public LoginResultResponse login(LoginRequest request) {
        var username = request.username();
        var password = request.password();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (UsernameNotFoundException e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository
            .findByUsernameOrEmail(username, username)
            .orElseThrow(() -> new BadCredentialsException("Invalid Username or Password"));

        return issueTokens(user);
    }

    @Override
    public LoginResultResponse refresh(RefreshRequest request) {
        String incomingHashToken = hash(request.refreshToken());
        RefreshToken storedHashToken = refreshTokenRepository
            .findByTokenHash(incomingHashToken)
            .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        if (!storedHashToken.isValid()) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        // Rotate: revoke the presented token and issue a branch new pair.
        storedHashToken.setRevoked(true);
        refreshTokenRepository.save(storedHashToken);
        return issueTokens(storedHashToken.getUser());
    }

    @Override
    @Transactional
    public void logout(RefreshRequest request) {
        // does the revoke the token directly

        String incomingHashToken = hash(request.refreshToken());
        refreshTokenRepository.findByTokenHash(incomingHashToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public CurrentUserResponse getCurrentUser(String username) {
        User user = userRepository
            .findByUsernameOrEmail(username, username)
            .orElseThrow(() -> ResourceNotFoundException.of("User", username));

        return new CurrentUserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getUsername(),
            user.getEmail(),
            user.getPhone(),
            user.getImage(),
            user.getRole(),
            user.getStatus()
        );
    }

    // Internal Utilities
    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(HASH_ALGORITHM + "is not available", e);
        }
    }

    private String generateRawRefreshToken() {
        byte[] bytes = new byte[64];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private LoginResultResponse issueTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(),
            user.getUsername(),
            user.getRole().name()
        );

        String rawRefreshToken = generateRawRefreshToken();
        RefreshToken refreshToken = new RefreshToken();
        // set to the record
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(rawRefreshToken));
        refreshToken.setExpiresAt(Instant.now().plus(refreshTokenTtlDays, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);
        AuthenticatedUserResponse authenticatedUserResponse = new AuthenticatedUserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getImage(),
            user.getRole()
        );

        return new LoginResultResponse(authenticatedUserResponse, accessToken, rawRefreshToken);
    }
}
