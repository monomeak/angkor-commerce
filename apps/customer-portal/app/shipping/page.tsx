import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderSummary } from "@/src/features/checkout/components/order-summary";
import { ShippingStep } from "@/src/features/checkout/components/shipping-step";

export default function ShippingPage() {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <SiteHeader />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <ShippingStep />
                    <OrderSummary />
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
