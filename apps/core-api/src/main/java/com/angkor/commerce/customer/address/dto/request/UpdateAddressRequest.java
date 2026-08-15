package com.angkor.commerce.customer.address.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

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
    @Pattern(regexp = "^[A-Z]{2}$") String country,

    // Moving the pin sends both; leaving the map alone sends neither and keeps what is stored.
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    BigDecimal latitude,

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    BigDecimal longitude
) {}
