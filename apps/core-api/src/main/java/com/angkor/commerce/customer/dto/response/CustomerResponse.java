package com.angkor.commerce.customer.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.customer.Customer;
import java.time.Instant;

public record CustomerResponse(
    Long id,
    String displayName,
    String firstName,
    String lastName,
    String companyName,
    String email,
    String phone,
    String taxNumber,
    RecordStatus status,
    Instant createdAt,
    Instant updatedAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getDisplayName(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getCompanyName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getTaxNumber(),
            customer.getStatus(),
            customer.getCreatedAt(),
            customer.getUpdatedAt()
        );
    }
}
