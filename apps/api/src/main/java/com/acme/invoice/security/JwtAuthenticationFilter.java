package com.acme.invoice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads the {@code Authorization: Bearer <token>} header, validates the JWT, and
 * populates the security context directly from the token's claims (no DB lookup
 * per request). Requests without a valid token simply pass through unauthenticated;
 * downstream authorization rules in {@link SecurityConfig} decide what that's allowed to reach.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, java.io.IOException {
        String token = extractToken(request);

        if (
            token != null &&
            jwtTokenProvider.isValid(token) &&
            SecurityContextHolder.getContext().getAuthentication() == null
        ) {
            String username = jwtTokenProvider.getUsername(token);
            String role = jwtTokenProvider.getUserRole(token);
            Long userId = jwtTokenProvider.getUserId(token);

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            var principal = new AuthenticatedUser(userId, username, role);
            Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);

            ((UsernamePasswordAuthenticationToken) authentication).setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER_NAME);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length()); // start from at the sub string  ""Bearer eyJhbG.ada.signature" => eyJhbG.ada.signature
        }
        return null;
    }

    public record AuthenticatedUser(Long id, String usernmae, String role) {}
}
