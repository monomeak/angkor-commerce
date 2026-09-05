package com.angkor.commerce.invoice;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.invoice.dto.request.InvoiceQueryParams;
import com.angkor.commerce.invoice.dto.response.InvoiceResponse;
import com.angkor.commerce.invoice.dto.response.InvoiceSummaryResponse;
import com.angkor.commerce.order.Order;

public interface InvoiceService {
    // ── Creation: exactly one way ──
    Invoice createIssuedInvoiceFromOrder(Order order);
    // -- Status Calculation
    void refreshPaymentState(Invoice invoice);
    // -- Read
    InvoiceResponse getInvoice(Long invoiceId);
    PageResponse<InvoiceSummaryResponse> getInvoices(InvoiceQueryParams query);
    PageResponse<InvoiceSummaryResponse> getMyInvoices(Long customerId, InvoiceQueryParams query);
    InvoiceResponse getMyInvoice(Long customerId, Long invoiceId);
    InvoiceResponse getMyInvoiceForOrder(Long customerId, Long orderId);
}
