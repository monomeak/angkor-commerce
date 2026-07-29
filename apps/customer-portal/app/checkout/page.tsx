import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutForm } from "@/src/features/checkout/components/checkout-form";
import { OrderSummary } from "@/src/features/checkout/components/order-summary";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Checkout</h1>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <CheckoutForm />
          <OrderSummary />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
