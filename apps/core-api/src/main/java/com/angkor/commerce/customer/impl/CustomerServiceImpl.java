package com.angkor.commerce.customer.impl;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.customer.CustomerService;
import com.angkor.commerce.customer.dto.request.CustomerQueryParams;
import com.angkor.commerce.customer.dto.response.CustomerResponse;
import com.angkor.commerce.customer.specification.CustomerSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private static final String COLLECTION_KEY = "customers";

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        return CustomerResponse.from(findCustomerOrThrow(id));
    }

    /**
     * Filtering, search and sorting all come from the query params, the same way products do.
     * OffsetPageable takes {@code skip} as a real offset — the old page-number division
     * silently rounded a skip that was not a multiple of the limit down to a page boundary.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> listCustomers(CustomerQueryParams query) {
        Page<Customer> page = customerRepository.findAll(CustomerSpecification.from(query), query.toPageable());

        return PageResponse.of(
            COLLECTION_KEY,
            page.getContent().stream().map(CustomerResponse::from).toList(),
            page.getTotalElements(),
            query.skipOrDefault(),
            query.limitOrDefault()
        );
    }

    private Customer findCustomerOrThrow(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Customer", id));
    }
}
