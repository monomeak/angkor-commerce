import type { InvoiceDto, InvoiceListDto, InvoiceSummaryDto } from "../schemas/invoice-api.schema";
import type { Invoice, InvoiceListResult, InvoiceSummary } from "../types/invoice";

/** Field-for-field; every number is the API's, and none is recomputed in the UI. */
export function mapInvoice(dto: InvoiceDto): Invoice {
    return { ...dto };
}

/** A customer with neither company nor name would have a blank displayName; the id identifies it. */
export function mapInvoiceSummary(dto: InvoiceSummaryDto): InvoiceSummary {
    return {
        ...dto,
        customerName: dto.customerName?.trim() || `Customer #${dto.customerId}`
    };
}

export function mapInvoiceList(dto: InvoiceListDto): InvoiceListResult {
    return {
        invoices: dto.invoices.map(mapInvoiceSummary),
        total: dto.total,
        skip: dto.skip,
        limit: dto.limit
    };
}
