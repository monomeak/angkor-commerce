# Cart, checkout, orders and receipts — core-api integration

Status: **applied**. The cart, checkout, order history and receipts run against `apps/core-api`.
Nothing in this flow reads mock data or localStorage any more, apart from the cart itself, which
has no backend endpoint (see [§1](#1-the-cart)).

Verified end-to-end against a running core-api: register → save address → add to cart → place
order → seed balance → pay → receipt.

---

## The shape of it

```
browser                         core-api
───────────────────────────────────────────────────────────────────────
add to cart        localStorage (variantId + display snapshot)

/shipping          GET  /storefront/addresses            pick one
                   POST /storefront/addresses            add one inline

/checkout          GET  /storefront/wallet?currency=USD  balance
                   POST /dev/wallet/seed                 demo money (dev only)
                   POST /storefront/orders               ── order placed, stock reserved
                   POST /storefront/checkout/orders/{id}/pay
                   POST /storefront/checkout/payments/{ref}/wallet-confirm
                                                         ── debited, invoiced, order INVOICED

/account/orders    GET  /storefront/orders
  …/{orderId}      GET  /storefront/orders/{id}
                   GET  /storefront/orders/{id}/invoice  the receipt
                   POST /storefront/orders/{id}/cancel

/account/transactions
                   GET  /storefront/wallet/transactions  the ledger
```

Everything under `/storefront` is customer-scoped: core-api reads the customer off the session
cookie and answers **404, never 403**, for another customer's row. Every hook here is therefore
gated on `useCurrentCustomer()`, the same way the wishlist and the address book are.

---

## 1. The cart

`src/features/cart/`. There is no cart endpoint in core-api and none is planned for the MVP, so
the cart stays in `localStorage` under `angkor-customer-cart`.

What changed is what a line **is**:

```ts
// before — mock product ids, size as a free string
{ productId: 7, size: "M", quantity: 2 }

// now — the variant is the unit of sale, plus a display snapshot
{ productId: 2, variantId: 3, quantity: 2,
  name: "Men's Classic Polo Shirt", size: "M", sku: "POLO-NVY-M",
  unitPrice: 11.25, currency: "USD", thumbnail: "products/2/thumbnail/….jpg",
  categorySlug: "men" }
```

- **Keyed by `variantId`.** Size, SKU, stock and price all live on the variant, never on the
  product, and `POST /storefront/orders` takes variant ids. Two sizes of one shirt are two lines.
- **The snapshot is display only.** It exists so the cart sheet and the checkout summary render
  without a request per line. It is never sent: the order request carries `{variantId, quantity}`
  and nothing else, and core-api prices every line from the variant it looks up. A stale snapshot
  costs a surprise at checkout, never a wrong charge.
- **Legacy lines are dropped, not migrated.** `isCartItem` in `cart-context.tsx` rejects the old
  shape, because those product ids referred to `products.data.ts` and mean nothing to the API.
- Adding the same variant twice refreshes the snapshot and sums the quantity.

`lib/cart-helpers.ts` owns the derived numbers — `cartSubtotal`, `cartItemCount`, `toOrderItems`,
`hasMixedCurrencies`. The last one is a client-side guard for a rule the API enforces: an order
whose lines disagree about currency is rejected.

`toCartLine(product, variant)` in `products/lib/cart-line.ts` is the one place a `Product` becomes
a cart line, so the detail page's price and the cart's price are computed the same way.

## 2. Checkout

Two routes, two steps, and the choice between them travels in the URL (`/checkout?addressId=12`)
rather than in storage — a refresh or a back-navigation keeps it.

### `/shipping` — where it ships

`POST /storefront/orders` requires a `shippingAddressId` from the customer's own address book;
core-api copies that row onto the order (`copyShippingAddress`) so later edits to the address book
never rewrite a placed order. There is nothing for a free-form form to send, so the old typed
shipping form, its `localStorage` draft and the lossy `toShippingAddress` adapter are **gone**.

`ShippingStep` lists the saved addresses and reuses `AddressForm` — map picker included — for
adding one inline. The API caps a customer at three.

### `/checkout` — paying

One button, two calls, deliberately not collapsed into one:

1. `POST /storefront/orders` → the order exists, holds its stock, and is already visible in the
   history. The cart is emptied into it at this point.
2. `startPayment` + `confirmWalletPayment` → the balance is debited, an invoice is issued and the
   order moves to `INVOICED`.

If step 2 fails — a short balance is the usual reason — **the order survives**. `CheckoutForm`
keeps it in state and the button becomes "Retry payment", so a top-up-and-retry never places a
second order. The same retry is available later from the order's own page, which is what
`PayPendingOrderButton` is for.

Only the subtotal is shown before the order is placed. Delivery is `angkor.order.shipping-fee` on
the API (currently `0`) and the real total comes back on the order; showing a client-side guess
would be the storefront inventing numbers.

### Paying from the wallet

The wallet is core-api's `WALLET` payment provider — a real double-entry ledger
(`wallet_transactions`, one row per movement, each carrying the balance it left behind), not a
number the client keeps.

`WalletPaymentGatewayAdapter` implements the same `PaymentGatewayPort` as ABA PayWay, so paying
from a balance takes the same intent → confirm → verify path as a QR payment. It just has nothing
external to call: `createIntent` returns a null `qrPayload`, and `checkStatus` answers "paid" by
finding the debit row in our own ledger.

`startPayment` is idempotent per order — a live, unexpired intent is handed back rather than a
second one being minted — which is why a refreshed checkout page cannot strand a payment.

ABA PayWay is wired on the backend but not offered in the UI: it needs real merchant credentials.
Adding it means rendering `qrPayload` as a QR and polling `GET /storefront/checkout/payment/{ref}`
until the status is terminal; `fetchPaymentStatus` is already in `checkout/api/checkout-api.ts`
for that.

### Demo balance

`POST /api/v1/dev/wallet/seed` credits a customer a demo amount. It is the one storefront call
that takes a customer id in its body instead of reading the session, because `/api/v1/dev/**` is
`permitAll` and only registered outside the `prod` profile (`WalletSeedController`, gated on
`angkor.wallet.seed.enabled`). `SeedBalanceButton` renders nothing when
`AppConfig.environment === "production"` for the same reason.

Real top-ups are staff-side (`POST /api/v1/wallets/{customerId}/top-up`) and have no storefront UI.

## 3. Orders and receipts

An order and its invoice are two different documents: the order is what was requested, the
invoice is what was actually charged. core-api issues exactly one invoice, at the moment a payment
is confirmed — so **an unpaid order has no receipt**, and that is a normal state, not an error.

- `/account/orders` — paged history, 10 a page, `?page=` in the URL.
- `/account/orders/{orderId}` — the order in full, plus:
  - the receipt (`OrderReceipt`), once the order is `invoiced`;
  - "Pay with balance", while it is `pending`;
  - "Cancel order", while it is `pending` — the API releases the reserved stock as it does.
- `/checkout/confirmation/{orderId}` — the same `OrderDetail`, under a success banner. It reads the
  order back from the API rather than echoing what was submitted, so reloading it or returning to
  the URL a week later shows the same thing.

The invoice list rows (`InvoiceSummaryResponse`) carry no `orderId`, so an order screen has nothing
to match on. **`GET /storefront/orders/{orderId}/invoice` was added to core-api** for this
(`OrderController.getMyOrderInvoice` → `InvoiceService.getMyInvoiceForOrder`), reusing the existing
`findByOrderIdAndStatusNot` query. It answers 404 until the payment lands; `fetchOrderInvoice`
turns that into `null`.

Printing uses a `data-print-region` marker and the `@media print` block at the bottom of
`app/globals.css`: everything else on the page is hidden by `visibility`, so the receipt prints
with the app's own styling and no separate print route.

`invoices/lib/invoice-helpers.ts` labels `PaymentMethod.OTHER` as "Wallet balance" — the wallet
adapter reports `OTHER` on purpose, since `QR_CODE` would be a lie.

## 4. The wallet page

`/account/transactions` shows the balance and the ledger behind it, 15 rows a page. Each row is
signed by its own `direction`, links to the order it paid for, and shows the balance it left
behind.

Wallets are per currency. The page asks for `USD`, which is what core-api's catalogue is priced in;
a second currency would need a picker here and a matching `?currency=` on the balance call.

---

## Backend changes this needed

Five, all in `apps/core-api`:

1. **`GET /storefront/orders/{orderId}/invoice`** — the receipt for an order.
   `InvoiceService.getMyInvoiceForOrder`, ownership-checked the same way `getMyInvoice` is
   (someone else's invoice is a 404).
2. **`WalletTransactionResponse.direction`** — the ledger row already stored `TxnDirection`; the
   DTO dropped it, leaving the client to infer credit-vs-debit from the transaction type.
3. **`GlobalExceptionHandler`** — the 402 (insufficient balance) and 409 (insufficient stock,
   already processed, already exists) handlers passed the detail as the error *title* and `null` as
   the message, so `ErrorResponse.message` came back empty and the storefront had nothing to show.
   A short balance now reads "Balance 20.0000 USD is not enough for 38.5000 USD".
4. **`InvoiceCalculator`** — `totalItems` was being set to the summed quantity and `totalQuantity`
   was never set, so every invoice stored `totalQuantity = 0`.
5. **`ProductStockAdapter.toSnapshot`** — order lines were priced at the variant's list price and
   ignored the product's `discountPercentage`, while the storefront advertises the discounted
   figure on the grid and the detail page. A shopper shown $11.25 was charged $12.50. The snapshot
   now carries the payable price, so the cart, the order, the invoice and the wallet debit all
   agree with the price tag.

## What is still mock

`/account/payment-methods` — saved cards in `localStorage`. Nothing in checkout reads them any
more; the page is a leftover from the pre-core-api flow and should either be deleted or wait for a
real card provider.
