package com.angkor.commerce.customer.address.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateAddressRequest(
    @Size(max = 50) String label,
    @NotBlank(message = "Recipient name is required") @Size(max = 150) String recipientName,

    @NotBlank(message = "Recipient phone is required")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Invalid phone number")
    String recipientPhone,

    @NotBlank(message = "Address line 1 is required") @Size(max = 255) String line1,
    @Size(max = 255) String line2,
    @Size(max = 100) String commune,

    @NotBlank(message = "District is required") @Size(max = 100) String district,

    @NotBlank(message = "Province is required") @Size(max = 100) String province,

    @Size(max = 20) String postalCode,

    @Pattern(regexp = "^[A-Z]{2}$", message = "Country must be a 2-letter ISO code") String country,

    // Optional map pin. Both or neither — the service rejects a lone one.
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    BigDecimal latitude,

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    BigDecimal longitude,

    Boolean isDefault
) {}
