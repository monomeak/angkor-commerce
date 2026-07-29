package com.acme.invoice.auth;

import com.acme.invoice.auth.dto.request.LoginRequest;
import com.acme.invoice.auth.dto.request.RefreshRequest;
import com.acme.invoice.auth.dto.response.AuthenticatedUserResponse;
import com.acme.invoice.auth.dto.response.CurrentUserResponse;
import com.acme.invoice.auth.dto.response.LoginResultResponse;
import com.acme.invoice.common.ApiConstants;
import com.acme.invoice.security.JwtAuthenticationFilter.AuthenticatedUser;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.AUTH_BASE)
public class AuthController {

    private final AuthService authService;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public AuthController(
        AuthService authService,
        @Value("${acme.cookie.secure}") boolean cookieSecure,
        @Value("${acme.cookie.same-site}") String cookieSameSite
    ) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticatedUserResponse> login(
        @RequestBody @Valid LoginRequest request,
        HttpServletResponse response
    ) {
        LoginResultResponse resultResponse = authService.login(request);
        addAuthCookies(response, resultResponse.accessToken(), resultResponse.refreshToken());
        return ResponseEntity.ok(resultResponse.user());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticatedUserResponse> refresh(
        @CookieValue(name = "refreshToken", required = true) RefreshRequest refreshToken,
        HttpServletResponse response
    ) {
        if (refreshToken == null) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        LoginResultResponse result = authService.refresh(refreshToken);

        return ResponseEntity.ok(result.user());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody @Valid RefreshRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CurrentUserResponse> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.usernmae()));
    }

    private void addAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(Duration.ofMinutes(15))
            .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(Duration.ofDays(10))
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessToken);
        response.addHeader(HttpHeaders.SET_COOKIE, refreshToken);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie expiredAccess = ResponseCookie.from("accessToken", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(0)
            .build();

        ResponseCookie expiredRefresh = ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path(ApiConstants.AUTH_BASE)
            .maxAge(0)
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, expiredAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, expiredRefresh.toString());
    }
}
