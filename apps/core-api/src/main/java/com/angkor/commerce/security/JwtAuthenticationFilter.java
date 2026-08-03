package com.angkor.commerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads the JWT from the {@code accessToken} httpOnly cookie set by {@code AuthCookieService},
 * validates it, and populates the security context directly from its claims (no DB lookup per
 * request). Requests without a valid token simply pass through unauthenticated; downstream
 * authorization rules in {@link SecurityConfig} decide what that's allowed to reach.
 *
 * Handles both principal types (staff and customer): the token's {@code typ} claim
 * (see {@link JwtTokenProvider}) decides which principal record and authority to build.
 * Customer requests get a fixed {@code ROLE_CUSTOMER} authority synthesized here — not
 * derived from {@code user.Role}, since that enum represents staff permission levels only.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String ACCESS_COOKIE_NAME = "accessToken";
    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, java.io.IOException {
        String token = extractToken(request);

        if (
            token != null &&
            jwtTokenProvider.isValid(token) &&
            SecurityContextHolder.getContext().getAuthentication() == null
        ) {
            UsernamePasswordAuthenticationToken authentication = jwtTokenProvider.isCustomerToken(token)
                ? buildCustomerAuthentication(token)
                : buildStaffAuthentication(token);

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private UsernamePasswordAuthenticationToken buildStaffAuthentication(String token) {
        String username = jwtTokenProvider.getUsername(token);
        String role = jwtTokenProvider.getUserRole(token);
        Long userId = jwtTokenProvider.getUserId(token);

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        var principal = new AuthenticatedUser(userId, username, role);
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }

    private UsernamePasswordAuthenticationToken buildCustomerAuthentication(String token) {
        String email = jwtTokenProvider.getUsername(token);
        Long customerId = jwtTokenProvider.getUserId(token);

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
        var principal = new AuthenticatedCustomer(customerId, email);
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }

    private String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (ACCESS_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public record AuthenticatedUser(Long id, String usernmae, String role) {}

    public record AuthenticatedCustomer(Long id, String email) {}
}
