# Order & Payment Flow (simple reference)

Short version of how a storefront purchase moves through the system. Full entity/column
detail lives in [`CORE_API_DATA_MODEL.md`](./CORE_API_DATA_MODEL.md) (decisions 1 & 4) and
[`CORE_API_PAYMENTS.md`](./CORE_API_PAYMENTS.md). Entities exist for all of this; the service
logic described below is not implemented yet.

```
Cart (client-only)
  -> Shipping form (client-only)
  -> Checkout submit
       -> Order + OrderItem[]      (snapshot from Product/ProductVariant)
       -> Order.status = PENDING
  -> Order auto-generates Invoice + InvoiceItem[]   (snapshot from OrderItem, not Product)
       -> Order.status = INVOICED
  -> Customer pays at checkout -> OrderPayment       (net new, not built)
  -> Staff records payment against Invoice -> Payment
       -> Invoice.paidAmount / balance / invoiceStatus updated
```

## 1. Cart

No server entity. Held client-side (`customer-portal` localStorage), just
`{productId, variantId, quantity}`. Nothing persists yet.

## 2. Shipping

Also client-side — a form collecting full name, phone, address, city, postal code, notes.
Maps to `Order.shipping*` columns but isn't saved until checkout submits.

## 3. Checkout -> `Order` / `OrderItem`

On submit, one `Order` row is created (customer, shipping fields, `status = PENDING`), plus
one `OrderItem` per cart line. `OrderItem` **snapshots** `sku`/`title`/`thumbnailUrl`/
`unitPriceSnapshot` from `Product`/`ProductVariant` at that instant — not a live reference —
so a later price change never retroactively changes a placed order.

## 4. Order -> `Invoice` / `InvoiceItem`

Once placed, an `Invoice` is generated from the `Order`. `InvoiceItem` rows snapshot from
**`OrderItem`** (not `Product` again), because `Invoice` can also be raised manually by staff
with no `Order` behind it — `InvoiceItem` has to work either way, and `InvoiceItem.product`
stays nullable (`ON DELETE SET NULL`) for the same "never break history" reason.

## 5. Payment — two different things, don't conflate

- **`OrderPayment`** (net new, not built): the customer's actual checkout payment
  (`DEV_WALLET`/KHQR), attached to `Order`.
- **`Payment`** (built): a staff bookkeeping entry against an `Invoice` — "customer paid $40
  via bank transfer on this date." Not a live transaction, no provider/webhook lifecycle.
  Recording one is what should update `Invoice.paidAmount`, `balance`, and `invoiceStatus`
  (`ISSUED` -> `PARTIALLY_PAID`/`PAID`) in the same transaction.

## Known gap

`Invoice` has no FK back to `Order` yet (decision 4 calls for one, nullable). Add it when
order-to-invoice generation actually gets built.
