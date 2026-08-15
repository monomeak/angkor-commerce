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
import java.math.BigDecimal;
import java.util.List;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
        requirePairedCoordinates(request.latitude(), request.longitude());
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
        CustomerAddress address = load(addressId, customerId);

        // PATCH semantics: a null field means "leave it alone". A blank one clears the column
        // when it is nullable — the only way a customer can drop a building line or a postal
        // code once it is saved — and is ignored on a required column, which cannot be blank.
        applyRequired(request.recipientName(), address::setRecipientName);
        applyRequired(request.recipientPhone(), address::setRecipientPhone);
        applyRequired(request.line1(), address::setLine1);
        applyRequired(request.district(), address::setDistrict);
        applyRequired(request.province(), address::setProvince);
        applyRequired(request.country(), address::setCountry);
        applyOptional(request.label(), address::setLabel);
        applyOptional(request.line2(), address::setLine2);
        applyOptional(request.commune(), address::setCommune);
        applyOptional(request.postalCode(), address::setPostalCode);

        // Coordinates only move as a pair, and only when the customer touched the map.
        requirePairedCoordinates(request.latitude(), request.longitude());
        if (request.latitude() != null) {
            address.setLatitude(request.latitude());
            address.setLongitude(request.longitude());
        }
        //  address is loaded and managed inside the @Transactional method. JPA dirty checking updates it when the transaction commits.
        return mapper.toResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(Long customerId, Long addressId) {
        CustomerAddress address = load(addressId, customerId);
        boolean wasDefault = address.isDefault();
        address.setStatus(RecordStatus.DELETED);
        address.setDefault(false);
        // Promote the next  address so the customer as a default one
        if (wasDefault) {
            addressRepository
                .findFirstByCustomerIdAndStatusAndIdNotOrderByCreatedAtAsc(customerId, RecordStatus.ACTIVE, addressId)
                .ifPresent(nextDefault -> nextDefault.setDefault(true));
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

    // Helpers
    /**
     * A pin is a point: half of one is a bug in the caller, and the DB rejects it anyway —
     * better a 400 naming the problem than a constraint violation.
     */
    private static void requirePairedCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if ((latitude == null) != (longitude == null)) {
            throw new ValidationException("Latitude and longitude must be sent together");
        }
    }

    /** Applies a PATCH field to a NOT NULL column: a blank value is treated as "not provided". */
    private static void applyRequired(String value, Consumer<String> setter) {
        if (StringUtils.hasText(value)) {
            setter.accept(value.trim());
        }
    }

    /** Applies a PATCH field to a nullable column, where a blank value clears it. */
    private static void applyOptional(String value, Consumer<String> setter) {
        if (value != null) {
            setter.accept(StringUtils.hasText(value) ? value.trim() : null);
        }
    }

    private CustomerAddress load(Long addressId, Long customerId) {
        return addressRepository
            .findActiveByIdAndCustomerId(addressId, customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Address with ID " + addressId + " was not found"));
    }
}
