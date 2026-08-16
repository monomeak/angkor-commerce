package com.angkor.commerce.customer.address;

import com.angkor.commerce.customer.address.dto.request.CreateAddressRequest;
import com.angkor.commerce.customer.address.dto.request.UpdateAddressRequest;
import com.angkor.commerce.customer.address.dto.response.AddressResponse;
import java.util.List;

public interface CustomerAddressService {
    List<AddressResponse> getAllByCustomerId(Long customerId);
    AddressResponse getByIdAndCustomerId(Long id, Long customerId);
    AddressResponse createAddress(Long customerId, CreateAddressRequest request);
    AddressResponse updateAddress(Long customerId, Long id, UpdateAddressRequest request);
    void deleteAddress(Long customerId, Long id);
    AddressResponse setDefaultAddress(Long customerId, Long id);
}
