package com.angkor.commerce.customer;

import com.angkor.commerce.common.BaseEntity;
import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Entity
@NoArgsConstructor
@Table(name = "customers")
public class Customer extends BaseEntity {

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "company_name")
    private String companyName;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RecordStatus status = RecordStatus.ACTIVE;

    @Column(name = "tax_number")
    private String taxNumber;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    public String getDisplayName() {
        if (companyName != null && !companyName.isBlank()) {
            return companyName;
        }
        return (firstName == null ? "" : firstName + " ") + (lastName == null ? "" : lastName);
    }
}
