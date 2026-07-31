import { Invoice } from "../../invoices/types/invoice";

export function filterInvoicesByRecentMonths(
  invoices: Invoice[],
  months?: number,
): Invoice[] {
  if (!months || invoices.length === 0) {
    return invoices;
  }

  const latestDate = invoices.reduce((latest, invoice) => {
    const issuedDate = new Date(invoice.issuedDate);
    return issuedDate > latest ? issuedDate : latest;
  }, new Date(0));

  const firstIncludedMonth = new Date(
    Date.UTC(
      latestDate.getUTCFullYear(),
      latestDate.getUTCMonth() - months + 1,
      1,
    ),
  );

  return invoices.filter(
    (invoice) => new Date(invoice.issuedDate) >= firstIncludedMonth,
  );
}
