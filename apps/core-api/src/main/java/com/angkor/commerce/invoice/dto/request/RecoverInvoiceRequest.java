package com.angkor.commerce.invoice.dto.request;

import com.angkor.commerce.payment.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Recovers an order whose payment succeeded but which the automated flow
 * failed to invoice — an amount mismatch flagged for review, or a
 * confirmation that arrived when the order was no longer PENDING.
 *
 * <p>Not a general manual-invoice feature. The service reuses
 * {@code createIssuedInvoiceFromOrder} verbatim, so there are no custom
 * lines, no negotiated prices, and no editable totals: {@code amountReceived}
 * must equal the order total exactly.
 *
 * <p>SUPER_ADMIN only. Every use logs at WARN with the reason.
 */
public record RecoverInvoiceRequest(
    @NotNull(message = "Order is required") Long orderId,

    /** Must equal the order total exactly — verified against ABA before recovering. */
    @NotNull(message = "Amount received is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amountReceived,

    @NotNull(message = "Payment method is required") PaymentMethod paymentMethod,

    /** When the money actually arrived, not when this record is created. */
    @NotNull(message = "Payment date is required")
    @PastOrPresent(message = "Payment date cannot be in the future")
    LocalDate paymentDate,

    /** The gateway transaction id, bank reference, or receipt number. */
    @Size(max = 150) String referenceNumber,

    @NotBlank(message = "Explain why this order needs manual recovery") @Size(max = 500) String reason
) {}
