package com.angkor.commerce.auth.impl;

import com.angkor.commerce.auth.CustomerAuthService;
import com.angkor.commerce.auth.CustomerRefreshToken;
import com.angkor.commerce.auth.CustomerRefreshTokenRepository;
import com.angkor.commerce.auth.dto.request.CustomerLoginRequest;
import com.angkor.commerce.auth.dto.request.RegisterCustomerRequest;
import com.angkor.commerce.auth.dto.response.AuthenticatedCustomerResponse;
import com.angkor.commerce.auth.dto.response.CurrentCustomerResponse;
import com.angkor.commerce.auth.dto.response.CustomerLoginResultResponse;
import com.angkor.commerce.auth.shared.RefreshTokenCrypto;
import com.angkor.commerce.auth.shared.RefreshTokenCrypto;
import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Deliberately doesn't go through Spring Security's {@code AuthenticationManager}/
 * {@code UserDetailsService} the way staff login does (see {@code AuthServiceImpl}) —
 * that machinery is wired to {@code User} only, and adding a second {@code UserDetailsService}
 * for customers would need its own discriminator to keep the two chains apart. Checking
 * the password hash directly keeps this flow self-contained, matching the "separate
 * identity chain" intent in CORE_API_DATA_MODEL.md decision 7.
 */
@Service
public class CustomerAuthServiceImpl implements CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final CustomerRefreshTokenRepository customerRefreshTokenRepository;
    private final RefreshTokenCrypto refreshTokenCrypto;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final long refreshTokenTtlDays;

    public CustomerAuthServiceImpl(
        CustomerRepository customerRepository,
        CustomerRefreshTokenRepository customerRefreshTokenRepository,
        RefreshTokenCrypto refreshTokenCrypto,
        JwtTokenProvider jwtTokenProvider,
        PasswordEncoder passwordEncoder,
        @Value("${angkor.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.customerRepository = customerRepository;
        this.customerRefreshTokenRepository = customerRefreshTokenRepository;
        this.refreshTokenCrypto = refreshTokenCrypto;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    @Override
    @Transactional
    public CustomerLoginResultResponse register(RegisterCustomerRequest request) {
        if (customerRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ValidationException("Email already in use", Map.of("email", "Email already in use"));
        }

        Customer customer = new Customer();
        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setCompanyName(request.companyName());
        customer.setEmail(request.email());
        customer.setPasswordHash(passwordEncoder.encode(request.password()));
        customer.setPhone(request.phone());
        customerRepository.save(customer);

        return issueTokens(customer);
    }

    @Override
    @Transactional
    public CustomerLoginResultResponse login(CustomerLoginRequest request) {
        Customer customer = customerRepository
            .findByEmailIgnoreCase(request.email())
            .filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (customer.getStatus() != RecordStatus.ACTIVE) {
            throw new BadCredentialsException("Invalid email or password");
        }

        customer.setLastLoginAt(Instant.now());
        customerRepository.save(customer);

        return issueTokens(customer);
    }

    @Override
    @Transactional
    public CustomerLoginResultResponse refresh(String refreshToken) {
        String incomingHash = refreshTokenCrypto.hash(refreshToken);
        CustomerRefreshToken storedToken = customerRefreshTokenRepository
            .findByTokenHash(incomingHash)
            .orElseThrow(() -> new BadCredentialsException("Invalid or expired refresh token"));

        if (!storedToken.isValid()) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        // Rotate: revoke the presented token and issue a brand new pair.
        storedToken.setRevoked(true);
        customerRefreshTokenRepository.save(storedToken);
        return issueTokens(storedToken.getCustomer());
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        String incomingHash = refreshTokenCrypto.hash(refreshToken);
        customerRefreshTokenRepository.findByTokenHash(incomingHash).ifPresent(token -> {
            token.setRevoked(true);
            customerRefreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public CurrentCustomerResponse getCurrentCustomer(String email) {
        Customer customer = customerRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> ResourceNotFoundException.of("Customer", email));

        return new CurrentCustomerResponse(
            customer.getId(),
            customer.getDisplayName(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getCompanyName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getStatus()
        );
    }

    private CustomerLoginResultResponse issueTokens(Customer customer) {
        String accessToken = jwtTokenProvider.generateCustomerAccessToken(customer.getId(), customer.getEmail());

        String rawRefreshToken = refreshTokenCrypto.generateRawToken();
        CustomerRefreshToken refreshToken = new CustomerRefreshToken();
        refreshToken.setCustomer(customer);
        refreshToken.setTokenHash(refreshTokenCrypto.hash(rawRefreshToken));
        refreshToken.setExpiresAt(Instant.now().plus(refreshTokenTtlDays, ChronoUnit.DAYS));
        customerRefreshTokenRepository.save(refreshToken);

        AuthenticatedCustomerResponse authenticatedCustomerResponse = new AuthenticatedCustomerResponse(
            customer.getId(),
            customer.getDisplayName(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getCompanyName(),
            customer.getEmail(),
            customer.getPhone()
        );

        return new CustomerLoginResultResponse(authenticatedCustomerResponse, accessToken, rawRefreshToken);
    }
}
