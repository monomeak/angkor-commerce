import { cn } from "@/lib/utils";
import { getStatusStyle } from "../lib/invoice-status-style";
import { InvoiceStatus } from "../types/dashboard";

interface InvoiceStatusBadgeProps {
  readonly status: InvoiceStatus;
  readonly className?: string;
}

export function InvoiceStatusBadge({
  status,
  className,
}: InvoiceStatusBadgeProps) {
  const style = getStatusStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.badgeClassName,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
