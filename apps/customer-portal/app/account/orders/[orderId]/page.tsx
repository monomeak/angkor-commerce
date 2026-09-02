import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { AccountContent } from "@/src/features/account/components/account-content";
import { OrderDetail } from "@/src/features/orders/components/order-detail";

type AccountOrderPageProps = {
    readonly params: Promise<{ orderId: string }>;
};

export default async function AccountOrderPage({ params }: AccountOrderPageProps) {
    const { orderId } = await params;
    const id = Number(orderId);

    if (!Number.isInteger(id)) {
        notFound();
    }

    return (
        <AccountContent title="Order details">
            <Link
                href="/account/orders"
                className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline print:hidden"
            >
                <ChevronLeft className="size-4" />
                All orders
            </Link>
            <OrderDetail orderId={id} />
        </AccountContent>
    );
}
