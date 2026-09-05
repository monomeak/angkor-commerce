import type { DummyCart } from "./dummy-cart";
import type { Invoice, InvoiceStatus } from "./types";
import { ALL_INVOICE_STATUSES } from "./status-style";
/**
 * DummyJSON's /carts has none of: invoice number, status, issued date, or
 * due date — it's shopping-cart data, not invoicing data. Everything
 * below marked "synthesized" is deterministically derived from the
 * cart's real `id`, purely so the UI has something realistic and STABLE
 * to render (same cart id always produces the same fake status/dates,
 * so the page doesn't jitter between renders/refetches).
 *
 * Swap this whole file out once a real invoices backend exists — every
 * component downstream only depends on the `Invoice` shape, not on how
 * these fields were produced.
 */

const ANCHOR_DATE = new Date("2026-01-01T00:00:00Z");
const DUE_OFFSET_DAYS = 14;

function synthesizeStatus(cartId: number): InvoiceStatus {
  return ALL_INVOICE_STATUSES[cartId % ALL_INVOICE_STATUSES.length];
}

function synthesizeIssuedDate(cartId: number): Date {
  // Spread invoices deterministically across ~180 days from the anchor.
  const offsetDays = (cartId * 7) % 180;
  const date = new Date(ANCHOR_DATE);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function mapCartToInvoice(dto: DummyCart): Invoice {
  const issuedDate = synthesizeIssuedDate(Number(dto.id));
  const dueDate = addDays(issuedDate, DUE_OFFSET_DAYS);

  return {
    id: dto.id,
    invoiceNumber: `INV-${String(dto.id).padStart(5, "0")}`,
    client: {
      userId: dto.userId,
      // Placeholder — DummyJSON carts only carry a userId, no client record.
      name: `Customer #${dto.userId}`,
      email: `customer${dto.userId}@example.com`,
    },
    products: dto.products.map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      price: p.price,
      quantity: p.quantity,
      total: p.total,
      discountPercentage: p.discountPercentage,
      discountedTotal: p.discountedTotal,
    })),
    totalProducts: dto.totalProducts,
    totalQuantity: dto.totalQuantity,
    amount: dto.total,
    amountDue: dto.discountedTotal, // amount to pay
    totalDiscount: dto.total - dto.discountedTotal,
    status: synthesizeStatus(Number(dto.id)),
    issuedDate: issuedDate.toISOString(),
    dueDate: dueDate.toISOString(),
  };
}
