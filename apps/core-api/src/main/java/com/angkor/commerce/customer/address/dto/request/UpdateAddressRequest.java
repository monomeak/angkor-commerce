package com.angkor.commerce.customer.address.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateAddressRequest(
        @Size(max = 50) String label,
        @Size(max = 150) String recipientName,
        @Pattern(regexp = "^\\+?[0-9]{8,15}$") String recipientPhone,
        @Size(max = 255) String line1,
        @Size(max = 255) String line2,
        @Size(max = 100) String commune,
        @Size(max = 100) String district,
        @Size(max = 100) String province,
        @Size(max = 20) String postalCode,
        @Pattern(regexp = "^[A-Z]{2}$") String country
) {
}
