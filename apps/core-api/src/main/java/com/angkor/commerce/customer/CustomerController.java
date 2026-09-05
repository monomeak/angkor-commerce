package com.angkor.commerce.customer;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.customer.dto.request.CustomerQueryParams;
import com.angkor.commerce.customer.dto.response.CustomerResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.CUSTOMERS_BASE)
@Tag(name = "Customer Module")
class CustomerController {

    private final CustomerService customerService; // final allow this object assign exactly once

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @Operation(summary = "List customers with pagination, search, status filter and sorting")
    public ResponseEntity<PageResponse<CustomerResponse>> listCustomers(@Valid CustomerQueryParams query) {
        return ResponseEntity.ok(this.customerService.listCustomers(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(this.customerService.getCustomerById(id));
    }
}
