package com.acme.invoice.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class JpaConfig {
    /**
     * Resolves the current user id for {@code @CreatedBy}/{@code @LastModifiedBy}.
     * Falls back to empty (null) for unauthenticated contexts such as startup seeding.
     */
    @Bean
    public AuditorAware<Long> auditorAware(){
        return ()->{
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if(authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof AuthenticatedUser user)){
                return Optional.empty();


            }
            return Optional.ofNullable(user.id)
        }
    }
}
