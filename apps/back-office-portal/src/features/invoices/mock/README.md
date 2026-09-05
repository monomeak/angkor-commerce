# Mock invoice model (DummyJSON `/carts`)

The pre-core-api invoice model, kept only because the **dashboard overview** and **reports**
screens are still built on it — they aggregate `Invoice[]` client-side and have no core-api
counterpart yet.

Nothing here is real: `/carts` has no invoice number, status, issue date or due date, so
`mapper.ts` synthesizes all four deterministically from the cart id (see its header). The
statuses it invents (`paid | pending | overdue | draft`) are **not** core-api's
(`ISSUED | PARTIALLY_PAID | PAID | CANCELLED`).

The real feature is the rest of `src/features/invoices/`, which talks to `GET /invoices`.
Delete this folder when the dashboard and reports are ported.
