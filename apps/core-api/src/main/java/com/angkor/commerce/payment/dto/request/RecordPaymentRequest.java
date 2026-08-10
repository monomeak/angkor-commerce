package com.angkor.commerce.payment.dto.request;

import com.angkor.commerce.payment.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecordPaymentRequest(
    @NotNull(message = "Invoice is required") Long invoiceId,

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @Pattern(regexp = "^[A-Z]{3}$") String currency,

    @NotNull(message = "Payment method is required") PaymentMethod paymentMethod,

    @NotNull @PastOrPresent(message = "Payment date cannot be in the future") LocalDate paymentDate,

    @Size(max = 150) String referenceNumber,
    @Size(max = 1000) String notes
) {}
