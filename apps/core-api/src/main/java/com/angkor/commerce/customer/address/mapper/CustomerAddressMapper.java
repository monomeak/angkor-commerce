package com.angkor.commerce.customer.address.mapper;

import static java.util.Objects.requireNonNullElse;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.address.CustomerAddress;
import com.angkor.commerce.customer.address.dto.request.CreateAddressRequest;
import com.angkor.commerce.customer.address.dto.response.AddressResponse;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class CustomerAddressMapper {

    private static final String DEFAULT_COUNTRY = "KH";

    public AddressResponse toResponse(CustomerAddress address) {
        return new AddressResponse(
            address.getId(),
            address.getLabel(),
            address.getRecipientName(),
            address.getRecipientPhone(),
            address.getLine1(),
            address.getLine2(),
            address.getCommune(),
            address.getDistrict(),
            address.getProvince(),
            address.getPostalCode(),
            address.getCountry(),
            address.isDefault(),
            address.getCreatedAt(),
            address.getUpdatedAt()
        );
    }

    public CustomerAddress toEntity(CreateAddressRequest request, Customer customer) {
        CustomerAddress address = new CustomerAddress();
        address.setCustomer(customer);
        address.setLabel(trimToNull(request.label()));
        address.setRecipientName(request.recipientName().trim());
        address.setRecipientPhone(request.recipientPhone().trim());
        address.setLine1(request.line1().trim());
        address.setLine2(trimToNull(request.line2()));
        address.setCommune(trimToNull(request.commune()));
        address.setDistrict(request.district().trim());
        address.setProvince(request.province().trim());
        address.setPostalCode(trimToNull(request.postalCode()));
        address.setCountry(requireNonNullElse(trimToNull(request.country()), DEFAULT_COUNTRY));
        address.setStatus(RecordStatus.ACTIVE);

        // isDefault is decided by the service, not the mapper
        return address;
    }

    public String toSingleLine(CustomerAddress address) {
        return Stream.of(
            address.getLine1(),
            address.getLine2(),
            address.getCommune(),
            address.getDistrict(),
            address.getProvince(),
            address.getPostalCode()
        )
            .filter(StringUtils::hasText)
            .collect(Collectors.joining(", "));
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
