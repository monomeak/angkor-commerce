import { notFound } from "next/navigation";
import { InvoiceReceiptView } from "@/src/features/invoices/views/invoice-receipt-view";

type InvoiceReceiptPageProps = {
    readonly params: Promise<{ invoiceId: string }>;
};

export default async function InvoiceReceiptPage({ params }: InvoiceReceiptPageProps) {
    const { invoiceId } = await params;
    const id = Number(invoiceId);

    if (!Number.isInteger(id)) {
        notFound();
    }

    return <InvoiceReceiptView invoiceId={id} />;
}
