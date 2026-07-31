package com.angkor.commerce.customer;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
class CustomerController {

	private final CustomerRepository customerRepository;

	CustomerController(CustomerRepository customerRepository) {
		this.customerRepository = customerRepository;
	}

	@GetMapping
	List<CustomerResponse> list() {
		return customerRepository.findAll().stream()
				.map(CustomerResponse::from)
				.toList();
	}

	@GetMapping("/{id}")
	ResponseEntity<CustomerResponse> get(@PathVariable Long id) {
		return customerRepository.findById(id)
				.map(CustomerResponse::from)
				.map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.notFound().build());
	}

}
