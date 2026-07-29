import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderConfirmation } from "@/src/features/checkout/components/order-confirmation";

type ConfirmationPageProps = {
  readonly params: Promise<{ orderNumber: string }>;
};

export default async function CheckoutConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderNumber } = await params;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
        <OrderConfirmation orderNumber={orderNumber} />
      </main>

      <SiteFooter />
    </div>
  );
}
