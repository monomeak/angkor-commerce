import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutForm } from "@/src/features/checkout/components/checkout-form";
import { OrderSummary } from "@/src/features/checkout/components/order-summary";

/** `?addressId=` is where the shipping step's choice lives, so a refresh keeps it. */
type CheckoutPageProps = {
    readonly searchParams: Promise<{ addressId?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
    const { addressId } = await searchParams;
    const chosenId = Number(addressId);

    return (
        <div className="flex min-h-full flex-1 flex-col">
            <SiteHeader />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
                <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Checkout</h1>
                <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
                    <CheckoutForm addressId={Number.isInteger(chosenId) ? chosenId : null} />
                    <OrderSummary />
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
