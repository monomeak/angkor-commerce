package com.angkor.commerce.customer;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.customer.dto.response.CustomerResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<PageResponse<CustomerResponse>> listCustomers(
        @RequestParam(defaultValue = "0") int skip,
        @RequestParam(defaultValue = "30") int limit,
        @RequestParam(required = false) String search
    ) {
        PageResponse<CustomerResponse> result = this.customerService.listCustomers(skip, limit, search);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(this.customerService.getCustomerById(id));
    }
}
