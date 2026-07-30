# Core API Payments

Drafted 2026-07-30, not yet implemented. Companion to `CORE_API_DATA_MODEL.md` (§6, "Payments") and
`ANGKOR_COMMERCE_PROJECT_PROPOSAL.md` §17.5 ("payment gateway integration... out of MVP scope" — this
is that decision, now made).

Two storefront payment methods, deliberately distinct from the existing back-office `payments` table
(see `CORE_API_DATA_MODEL.md` §6 for why they don't share a table):

1. **Prepaid balance (`DEV_WALLET`)** — fake/internal payment, development only.
2. **KHQR (`KHQR`)** — real payment through ABA PayWay.

Named `DEV_WALLET` rather than something that could be mistaken for a real production payment method.

## Enums

```java
public enum PaymentMethod {
    DEV_WALLET,
    KHQR
}

public enum PaymentProvider {
    INTERNAL,
    ABA_PAYWAY
}

public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    CANCELLED,
    EXPIRED,
    REFUNDED
}
```

| Method | Provider | Environment |
|---|---|---|
| `DEV_WALLET` | `INTERNAL` | Development only |
| `KHQR` | `ABA_PAYWAY` | Sandbox and production |

## Checkout UI

Development:

```text
Choose payment method

○ Prepaid balance — Development only
  Balance: USD 1,000.00

○ KHQR
  Pay using a supported Cambodian banking app
```

Production:

```text
Choose payment method

○ KHQR
  Pay using a supported Cambodian banking app
```

`DEV_WALLET` must not be hidden in the frontend only — the backend rejects it in production too (see
"Defense in depth" below). Note this also means the "saved card" feature already built in
`customer-portal` (Luhn validation, add/edit) has no real counterpart in this design — KHQR is a
per-transaction QR/bank-app flow, not a stored card token. See `CORE_API_DATA_MODEL.md` open question 3.

## Environment configuration

```yaml
app:
  payment:
    dev-wallet-enabled: ${DEV_WALLET_ENABLED:false}
```

```env
# Development
DEV_WALLET_ENABLED=true

# Production
DEV_WALLET_ENABLED=false
```

```java
@ConfigurationProperties(prefix = "app.payment")
public record PaymentProperties(boolean devWalletEnabled) {}

@Configuration
@EnableConfigurationProperties(PaymentProperties.class)
public class PaymentConfiguration {}
```

Frontend only ever uses a public flag to decide whether to *show* the option — it is never the security
control:

```env
NEXT_PUBLIC_DEV_WALLET_ENABLED=true
```

```tsx
const paymentMethods = [
  ...(process.env.NEXT_PUBLIC_DEV_WALLET_ENABLED === "true"
    ? [{ value: "DEV_WALLET", label: "Prepaid balance", description: "Development only" }]
    : []),
  { value: "KHQR", label: "KHQR", description: "Pay using your banking app" },
];
```

## Defense in depth for production

Combine the feature flag with the Spring profile — both, not either:

```java
if (!paymentProperties.devWalletEnabled() || environment.matchesProfiles("prod")) {
    throw new IllegalStateException("Development wallet cannot be used in production");
}
```

Stricter still: register the processor bean only outside production, so it can't even be selected:

```java
@Component
@Profile({"local", "dev", "test"})
public class DevWalletPaymentProcessor implements PaymentProcessor {
    // ...
}
```

## Request

One endpoint for both methods:

```http
POST /api/v1/storefront/orders/{orderId}/payments
```

```json
{ "method": "DEV_WALLET" }
```

```json
{ "method": "KHQR" }
```

**The amount never comes from the frontend.** The backend loads the order and computes the amount
itself — this is non-negotiable, not just a nice-to-have.

## Processor strategy

```java
public interface PaymentProcessor {
    PaymentMethod supportedMethod();
    PaymentResult process(Payment payment, Order order);
}
```

`DevWalletPaymentProcessor` — checks the flag, deducts from a fake per-customer balance
(`DevWalletService`), returns immediately as `PaymentResult.completed(...)`.

`KhqrPaymentProcessor` — calls `PayWayClient.generateQr(...)`, returns `PaymentResult.pending(qrImage,
abaPayDeeplink, expiresAt)`. Completion arrives later via a PayWay webhook.

```java
@Service
public class PaymentProcessorRegistry {
    private final Map<PaymentMethod, PaymentProcessor> processors;

    public PaymentProcessorRegistry(List<PaymentProcessor> paymentProcessors) {
        this.processors = paymentProcessors.stream()
            .collect(Collectors.toUnmodifiableMap(PaymentProcessor::supportedMethod, Function.identity()));
    }

    public PaymentProcessor get(PaymentMethod paymentMethod) {
        PaymentProcessor processor = processors.get(paymentMethod);
        if (processor == null) {
            throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
        }
        return processor;
    }
}
```

`PaymentService.createPayment(orderId, customerId, request)`: load order (scoped to the authenticated
customer), reject if already paid, create a `PENDING` payment row, dispatch to the resolved processor,
apply the result, return the response. Keeps the service itself payment-method-agnostic.

## Flow comparison

```text
DEV_WALLET                              KHQR
-----------                             ----
Select DEV_WALLET                       Select KHQR
  ↓                                       ↓
Check dev-wallet-enabled                Payment created as PENDING
  ↓                                       ↓
Load fake balance                       Request QR from PayWay
  ↓                                       ↓
Deduct order amount                     Frontend displays QR
  ↓                                       ↓
Payment → PAID (synchronous)            Customer completes payment in their banking app
  ↓                                       ↓
Order → PAID                            PayWay webhook reaches backend
                                           ↓
                                         Backend verifies payment
                                           ↓
                                         Payment and Order → PAID (asynchronous)
```

Example dev wallet: customer "Mono", USD 1,000.00 balance. After a USD 25.00 order: balance USD 975.00,
payment status `PAID`.

## Recommended package structure

```text
payment/
├── Payment.java
├── PaymentMethod.java
├── PaymentProvider.java
├── PaymentStatus.java
├── PaymentService.java
├── processor/
│   ├── PaymentProcessor.java
│   ├── PaymentProcessorRegistry.java
│   ├── DevWalletPaymentProcessor.java
│   └── KhqrPaymentProcessor.java
├── devwallet/
│   ├── DevWallet.java
│   ├── DevWalletService.java
│   └── DevWalletRepository.java
└── payway/
    ├── PayWayClient.java
    ├── PayWayRequestSigner.java
    └── PayWayWebhookController.java
```

## Environment matrix

```text
Local development:  DEV_WALLET + KHQR sandbox
Testing environment: DEV_WALLET + KHQR sandbox
Production:          KHQR only
```

## Sequencing

Per `CORE_API_DATA_MODEL.md`'s dependency order, this is the last piece to build — it needs `Order` (and
by extension `Customer`, `Product`) to exist first, since a payment always resolves against a real order
amount. Not started until `Category`/`Address`/`Product`/`Order` land.
