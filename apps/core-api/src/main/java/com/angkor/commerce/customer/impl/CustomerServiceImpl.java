package com.angkor.commerce.customer.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.customer.CustomerService;
import com.angkor.commerce.customer.dto.response.CustomerResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private static final String COLLECTION_KEY = "customers";

    // public CustomerServiceImpl(CustomerRepository customerRepository) {
    //     this.customerRepository = customerRepository;
    // }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        return CustomerResponse.from(findCustomerOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> listCustomers(int skip, int limit, String search) {
        int safeLimit = limit <= 0 ? 30 : limit;
        int pageNumber = safeLimit == 0 ? 0 : skip / safeLimit;
        Pageable pageable = PageRequest.of(pageNumber, safeLimit, Sort.by(Sort.Direction.ASC, "id"));

        Page<Customer> page;
        if (StringUtils.hasText(search)) {
            page =
                customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search,
                    search,
                    search,
                    pageable
                );
        } else {
            page = customerRepository.findAll(pageable);
        }

        var items = page.getContent().stream().map(CustomerResponse::from).toList();
        return PageResponse.of(COLLECTION_KEY, items, page.getTotalElements(), skip, safeLimit);
    }

    private Customer findCustomerOrThrow(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Customer", id));
    }
}
