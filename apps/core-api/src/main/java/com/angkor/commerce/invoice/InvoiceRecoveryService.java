package com.angkor.commerce.invoice;

import com.angkor.commerce.invoice.dto.request.RecoverInvoiceRequest;
import com.angkor.commerce.invoice.dto.response.InvoiceResponse;

public interface InvoiceRecoveryService {
    InvoiceResponse recover(RecoverInvoiceRequest request, Long staffId);
}
