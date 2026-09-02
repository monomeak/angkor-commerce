package com.angkor.commerce.invoice;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

@Component
public class InvoiceCalculator {

    private static final int MONEY_SCALE = 4;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    /**
     * Recomputes every derived money field from the items.
     *
     * The sequence IS the point of this class:
     *
     *   line.total           = price × quantity            (exact — DB CHECK)
     *   line.discountedTotal = total − (total × lineDisc%)
     *   subtotal             = Σ line.discountedTotal
     *   discountAmount       = subtotal × invoiceDisc%
     *   taxable              = subtotal − discountAmount
     *   taxAmount            = taxable × tax%
     *   total                = taxable + taxAmount
     *   balance              = total − paidAmount
     */

    public void recalculate(Invoice invoice) {
        BigDecimal subTotal = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (InvoiceItem item : invoice.getItems()) {
            // Exact product, no rounding — the DB CHECK compares equality
            BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal lineDiscount = lineTotal
                .multiply(item.getDiscountPercentage())
                .divide(HUNDRED, MONEY_SCALE, ROUNDING);
            item.setTotal(lineTotal);
            item.setDiscountedTotal(lineTotal.subtract(lineDiscount));
            subTotal = subTotal.add(item.getDiscountedTotal());
            totalQuantity += item.getQuantity();
        }

        BigDecimal discountAmount = subTotal
            .multiply(invoice.getDiscountPercentage())
            .divide(HUNDRED, MONEY_SCALE, ROUNDING);

        BigDecimal taxable = subTotal.subtract(discountAmount);
        BigDecimal taxAmount = taxable.multiply(invoice.getTaxPercentage()).divide(HUNDRED, MONEY_SCALE, ROUNDING);

        invoice.setSubtotal(subTotal);
        invoice.setDiscountAmount(discountAmount);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(taxable.add(taxAmount)); // INCLUDE TAX
        invoice.setTotalItems(invoice.getItems().size());
        invoice.setTotalQuantity(totalQuantity);
        invoice.recalculateBalance();
    }
}
