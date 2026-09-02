import type { InvoiceDto } from "../schemas/invoice-api.schema";
import type { Invoice } from "../types/invoice";

export function mapInvoice(dto: InvoiceDto): Invoice {
    return {
        id: dto.id,
        invoiceNumber: dto.invoiceNumber,
        invoiceStatus: dto.invoiceStatus,
        orderId: dto.orderId,
        customer: dto.customer,
        items: dto.items,
        payments: dto.payments,
        issueDate: dto.issueDate,
        dueDate: dto.dueDate,
        subtotal: dto.subtotal,
        discountPercentage: dto.discountPercentage,
        discountAmount: dto.discountAmount,
        taxPercentage: dto.taxPercentage,
        taxAmount: dto.taxAmount,
        total: dto.total,
        paidAmount: dto.paidAmount,
        balance: dto.balance,
        currency: dto.currency,
        totalItems: dto.totalItems,
        totalQuantity: dto.totalQuantity,
        notes: dto.notes,
        issuedAt: dto.issuedAt
    };
}
