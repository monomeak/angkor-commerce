package com.angkor.commerce.customer;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.customer.dto.response.CustomerResponse;

public interface CustomerService {
    CustomerResponse getCustomerById(Long id);
    PageResponse<CustomerResponse> listCustomers(int skip, int limit, String search);
}
