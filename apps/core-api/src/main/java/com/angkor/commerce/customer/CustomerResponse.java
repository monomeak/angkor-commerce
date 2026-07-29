package com.angkor.commerce.customer;

import java.time.Instant;

import com.angkor.commerce.common.enums.RecordStatus;

public record CustomerResponse(
		Long id,
		CustomerType customerType,
		String displayName,
		String firstName,
		String lastName,
		String companyName,
		String email,
		String phone,
		String taxNumber,
		RecordStatus recordStatus,
		Instant createdAt,
		Instant updatedAt) {

	static CustomerResponse from(Customer customer) {
		return new CustomerResponse(
				customer.getId(),
				customer.getCustomerType(),
				customer.getDisplayName(),
				customer.getFirstName(),
				customer.getLastName(),
				customer.getCompanyName(),
				customer.getEmail(),
				customer.getPhone(),
				customer.getTaxNumber(),
				customer.getRecordStatus(),
				customer.getCreatedAt(),
				customer.getUpdatedAt());
	}

}
