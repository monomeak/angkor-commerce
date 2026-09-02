import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderConfirmation } from "@/src/features/checkout/components/order-confirmation";

type ConfirmationPageProps = {
    readonly params: Promise<{ orderId: string }>;
};

export default async function CheckoutConfirmationPage({ params }: ConfirmationPageProps) {
    const { orderId } = await params;
    const id = Number(orderId);

    if (!Number.isInteger(id)) {
        notFound();
    }

    return (
        <div className="flex min-h-full flex-1 flex-col">
            <SiteHeader />

            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
                <OrderConfirmation orderId={id} />
            </main>

            <SiteFooter />
        </div>
    );
}
