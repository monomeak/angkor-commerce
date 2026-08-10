package com.angkor.commerce.customer.dto.response;

import com.angkor.commerce.customer.Customer;

public record CustomerSummaryResponse(
    Long id,
    String displayName,
    String email,
    String phone
) {
    public static CustomerSummaryResponse from(Customer customer) {
        return new CustomerSummaryResponse(
            customer.getId(),
            customer.getDisplayName(),
            customer.getEmail(),
            customer.getPhone()
        );
    }
}
