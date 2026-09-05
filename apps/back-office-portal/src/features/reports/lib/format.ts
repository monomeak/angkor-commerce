/*
 * USD-only money and date formatting for the reports screens, which are still built on the
 * DummyJSON invoice model. Everything ported to core-api uses `@/lib/formatters` instead,
 * which takes the record's own currency rather than assuming one.
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}
