package com.angkor.commerce.auth;

import com.angkor.commerce.auth.dto.request.LoginRequest;
import com.angkor.commerce.auth.dto.request.UpdateProfileRequest;
import com.angkor.commerce.auth.dto.response.AuthenticatedUserResponse;
import com.angkor.commerce.auth.dto.response.CurrentUserResponse;
import com.angkor.commerce.auth.dto.response.LoginResultResponse;
import com.angkor.commerce.auth.shared.AuthCookieService;
import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedUser;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.AUTH_BASE)
public class AuthController {

    private static final String ACCESS_COOKIE = "accessToken";
    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    public AuthController(AuthService authService, AuthCookieService authCookieService) {
        this.authService = authService;
        this.authCookieService = authCookieService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticatedUserResponse> login(
        @RequestBody @Valid LoginRequest request,
        HttpServletResponse response
    ) {
        LoginResultResponse resultResponse = authService.login(request);
        authCookieService.setAuthCookies(
            response,
            ACCESS_COOKIE,
            resultResponse.accessToken(),
            REFRESH_COOKIE,
            resultResponse.refreshToken()
        );
        return ResponseEntity.ok(resultResponse.user());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticatedUserResponse> refresh(
        @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
        HttpServletResponse response
    ) {
        if (refreshToken == null) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        LoginResultResponse result = authService.refresh(refreshToken);
        authCookieService.setAuthCookies(
            response,
            ACCESS_COOKIE,
            result.accessToken(),
            REFRESH_COOKIE,
            result.refreshToken()
        );

        return ResponseEntity.ok(result.user());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
        @CookieValue(name = REFRESH_COOKIE, required = true) String refreshToken,
        HttpServletResponse response
    ) {
        authService.logout(refreshToken);
        authCookieService.clearAuthCookies(response, ACCESS_COOKIE, REFRESH_COOKIE);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.usernmae()));
    }

    @PatchMapping("/me")
    public ResponseEntity<CurrentUserResponse> updateMe(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestBody @Valid UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(authService.updateCurrentUser(principal.id(), request));
    }
}
