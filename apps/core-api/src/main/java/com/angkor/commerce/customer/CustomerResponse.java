package com.angkor.commerce.customer;

import java.time.Instant;

public record CustomerResponse(
		Long id,
		String name,
		String email,
		String phone,
		String billingAddress,
		CustomerStatus status,
		Instant createdAt,
		Instant updatedAt) {

	static CustomerResponse from(Customer customer) {
		return new CustomerResponse(
				customer.getId(),
				customer.getName(),
				customer.getEmail(),
				customer.getPhone(),
				customer.getBillingAddress(),
				customer.getStatus(),
				customer.getCreatedAt(),
				customer.getUpdatedAt());
	}

}
