package com.angkor.commerce.customer;

import com.angkor.commerce.common.enums.RecordStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Setter
@Getter
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @Column(name = "tax_number")
    private String taxNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_status", nullable = false)
    private RecordStatus recordStatus = RecordStatus.ACTIVE;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Customer() {
        // required by Hibernate
    }

    public Customer(
        String firstName,
        String lastName,
        String companyName,
        String email,
        String passwordHash,
        String phone
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.companyName = companyName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
    }

    public String getDisplayName() {
        if (companyName != null && !companyName.isBlank()) {
            return companyName;
        }
        return (firstName == null ? "" : firstName + " ") + (lastName == null ? "" : lastName);
    }
}
