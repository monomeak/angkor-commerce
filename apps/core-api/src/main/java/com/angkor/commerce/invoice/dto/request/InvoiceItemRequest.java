package com.angkor.commerce.invoice.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import org.springframework.util.StringUtils;

public record InvoiceItemRequest(
    /** When present, price/title come from the catalogue. */
    Long variantId,

    @Size(max = 200) String title,
    String description,
    @Size(max = 50) String unit,

    @DecimalMin("0.0") @Digits(integer = 15, fraction = 4) BigDecimal price,

    @NotNull @Min(1) Integer quantity,

    @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal discountPercentage
) {
    public boolean isValidLince() {
        return variantId != null || (StringUtils.hasText(title) && price != null);
    }
}
