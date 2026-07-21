import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  formatDate,
} from "../../dashboard-overview/lib/format";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { useInvoiceDetails } from "../hooks/use-invoice-details";

interface InvoiceDetailsDialogProps {
  readonly invoiceId: string | null;
  readonly onClose: () => void;
}

export function InvoiceDetailsDialog({
  invoiceId,
  onClose,
}: InvoiceDetailsDialogProps) {
  const { invoice, isLoading } = useInvoiceDetails(invoiceId);

  return (
    <Dialog
      open={invoiceId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {invoice
              ? invoice.invoiceNumber
              : isLoading
                ? "Loading..."
                : "Invoice"}
          </DialogTitle>
        </DialogHeader>

        {!invoice ? (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading invoice details..." : "Invoice not found."}
          </p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Billed to</p>
                <p className="font-medium">{invoice.client.name}</p>
                <p className="text-sm text-muted-foreground">
                  {invoice.client.email}
                </p>
              </div>
              <div className="text-right">
                <InvoiceStatusBadge status={invoice.status} />
                <p className="mt-2 text-sm text-muted-foreground">
                  Issued {formatDate(invoice.issuedDate)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border divide-y">
              {invoice.products?.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="size-12 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} × {formatCurrency(product.price)}
                      {product.discountPercentage > 0 &&
                        ` · ${product.discountPercentage.toFixed(1)}% off`}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(product.discountedTotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-t pt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Discount</span>
                <span>- {formatCurrency(invoice.totalDiscount)}</span>
              </div>

              <div className="flex justify-between text-base font-semibold">
                <span>Amount due</span>
                <span>{formatCurrency(invoice.amountDue)}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
