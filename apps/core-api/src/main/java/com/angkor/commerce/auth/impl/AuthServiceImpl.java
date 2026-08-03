package com.angkor.commerce.auth.impl;

import com.angkor.commerce.auth.AuthService;
import com.angkor.commerce.auth.RefreshToken;
import com.angkor.commerce.auth.RefreshTokenRepository;
import com.angkor.commerce.auth.dto.request.LoginRequest;
import com.angkor.commerce.auth.dto.request.UpdateProfileRequest;
import com.angkor.commerce.auth.dto.response.AuthenticatedUserResponse;
import com.angkor.commerce.auth.dto.response.CurrentUserResponse;
import com.angkor.commerce.auth.dto.response.LoginResultResponse;
import com.angkor.commerce.auth.shared.RefreshTokenCrypto;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.security.JwtTokenProvider;
import com.angkor.commerce.user.User;
import com.angkor.commerce.user.UserRepository;
import jakarta.transaction.Transactional;
import java.util.Map;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenCrypto refreshTokenCrypto;
    private final JwtTokenProvider jwtTokenProvider;
    private final long refreshTokenTtlDays;

    public AuthServiceImpl(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        RefreshTokenCrypto refreshTokenCrypto,
        JwtTokenProvider jwtTokenProvider,
        @Value("${angkor.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenCrypto = refreshTokenCrypto;
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
    @Transactional
    public LoginResultResponse refresh(String refreshToken) {
        String incomingHashToken = refreshTokenCrypto.hash(refreshToken);
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
    public void logout(String refreshToken) {
        // does the revoke the token directly

        String incomingHashToken = refreshTokenCrypto.hash(refreshToken);
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

    @Override
    @Transactional
    public CurrentUserResponse updateCurrentUser(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ValidationException(
                    "Email is already registered",
                    Map.of("email", "This email is already in use.")
                );
            }
            user.setEmail(request.email());
        }
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.image() != null) {
            user.setImage(request.image());
        }

        userRepository.save(user);
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

    private LoginResultResponse issueTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(),
            user.getUsername(),
            user.getRole().name()
        );

        String rawRefreshToken = refreshTokenCrypto.generateRawToken();
        RefreshToken refreshToken = new RefreshToken();
        // set to the record
        refreshToken.setUser(user);
        refreshToken.setTokenHash(refreshTokenCrypto.hash(rawRefreshToken));
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
