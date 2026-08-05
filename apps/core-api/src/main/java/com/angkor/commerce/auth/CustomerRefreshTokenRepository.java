package com.angkor.commerce.auth;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRefreshTokenRepository extends JpaRepository<CustomerRefreshToken, Long> {
    Optional<CustomerRefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query(
        "update CustomerRefreshToken rt set rt.revoked = true where rt.customer.id = :customerId and rt.revoked = false"
    )
    void revokeAllForCustomer(@Param("customerId") Long customerId);

    @Modifying
    @Query("delete from CustomerRefreshToken rt where rt.expiresAt < :now")
    void deleteAllExpiredBefore(@Param("now") Instant now);
}
