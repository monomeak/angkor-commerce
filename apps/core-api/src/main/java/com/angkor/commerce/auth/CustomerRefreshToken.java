package com.angkor.commerce.auth;

import com.angkor.commerce.customer.Customer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Mirrors {@link RefreshToken}, scoped to customers instead of staff. Kept as its own
 * table/entity rather than a nullable dual-FK on {@code refresh_tokens} so staff and
 * customer sessions stay two structurally separate identity chains (see
 * CORE_API_DATA_MODEL.md decision 7). Stores only a hash of the refresh token, never
 * the raw value.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "customer_refresh_tokens")
@EntityListeners(AuditingEntityListener.class)
public class CustomerRefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public boolean isValid() {
        return !revoked && expiresAt.isAfter(Instant.now());
    }
}
