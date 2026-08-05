package com.angkor.commerce.customer.address.impl;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.CustomerRepository;
import com.angkor.commerce.customer.address.CustomerAddress;
import com.angkor.commerce.customer.address.CustomerAddressRepository;
import com.angkor.commerce.customer.address.CustomerAddressService;
import com.angkor.commerce.customer.address.dto.request.CreateAddressRequest;
import com.angkor.commerce.customer.address.dto.request.UpdateAddressRequest;
import com.angkor.commerce.customer.address.dto.response.AddressResponse;
import com.angkor.commerce.customer.address.mapper.CustomerAddressMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerAddressServiceImpl implements CustomerAddressService {

    private static final int MAX_ADDRESSES = 3;
    private final CustomerAddressRepository addressRepository;
    private final CustomerRepository customerRepository;
    private final CustomerAddressMapper mapper;

    @Override
    public List<AddressResponse> getAllByCustomerId(Long customerId) {
        return addressRepository.findActiveByCustomerId(customerId).stream().map(mapper::toResponse).toList();
    }

    @Override
    public AddressResponse getByIdAndCustomerId(Long addressId, Long customerId) {
        CustomerAddress result = load(addressId, customerId);
        return mapper.toResponse(result);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long customerId, CreateAddressRequest request) {
        // check if it is reached the limit
        if (addressRepository.countActiveByCustomerId(customerId) >= MAX_ADDRESSES) {
            throw new ValidationException("You cannot save more than " + MAX_ADDRESSES + " addresses");
        }
        Customer customer = customerRepository
            .findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + customerId + " was not found"));
        CustomerAddress address = mapper.toEntity(request, customer);
        // Make the first address default by default
        boolean makeDefault =
            Boolean.TRUE.equals(request.isDefault()) || addressRepository.countActiveByCustomerId(customerId) == 0;
        if (makeDefault) {
            addressRepository.clearDefaultFor(customerId);
            addressRepository.flush(); // release the partial unique index
            address.setDefault(true);
        }

        return mapper.toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long customerId, Long addressId, UpdateAddressRequest request) {
        CustomerAddress address = load(customerId, addressId);

        // Save check
        if (request.label() != null) address.setLabel(request.label());
        if (request.recipientName() != null) address.setRecipientName(request.recipientName());
        if (request.recipientPhone() != null) address.setRecipientPhone(request.recipientPhone());
        if (request.line1() != null) address.setLine1(request.line1());
        if (request.line2() != null) address.setLine2(request.line2());
        if (request.commune() != null) address.setCommune(request.commune());
        if (request.district() != null) address.setDistrict(request.district());
        if (request.province() != null) address.setProvince(request.province());
        if (request.postalCode() != null) address.setPostalCode(request.postalCode());
        if (request.country() != null) address.setCountry(request.country());
        //  address is loaded and managed inside the @Transactional method. JPA dirty checking updates it when the transaction commits.
        return mapper.toResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(Long customerId, Long addressId) {
        CustomerAddress address = load(addressId, customerId);
        address.setStatus(RecordStatus.DELETED);
        address.setDefault(false);
        // Promote the next  address so the customer as a default one
        if (address.isDefault()) {
            addressRepository
                .findActiveByIdAndCustomerId(addressId, customerId)
                .stream()
                .filter(a -> !a.getId().equals(addressId))
                .findFirst()
                .ifPresent(a -> a.setDefault(true));
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long customerId, Long addressId) {
        CustomerAddress address = load(addressId, customerId);
        if (!address.isDefault()) {
            addressRepository.clearDefaultFor(customerId);
            addressRepository.flush();
            address.setDefault(true);
        }
        return mapper.toResponse(addressRepository.save(address));
    }

    // Helper
    private CustomerAddress load(Long addressId, Long customerId) {
        return addressRepository
            .findActiveByIdAndCustomerId(addressId, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Address with ID " + addressId + " was not found"));
    }
}
