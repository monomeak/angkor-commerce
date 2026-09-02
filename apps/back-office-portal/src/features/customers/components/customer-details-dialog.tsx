"use client";

import { useTranslations } from "next-intl";
import { Building2, CalendarDays, Hash, Mail, Phone, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/formatters";
import { CustomerAvatar } from "./customer-avatar";
import { CustomerStatusBadge } from "./customer-status-badge";
import { useCustomerDetails } from "../hooks/use-customer-details";

interface CustomerDetailsDialogProps {
    readonly customerId: number | null;
    readonly onClose: () => void;
}

export function CustomerDetailsDialog({ customerId, onClose }: CustomerDetailsDialogProps) {
    const t = useTranslations("Customers");
    const { data: customer, isLoading, isError } = useCustomerDetails(customerId);

    const statusLabel = customer
        ? { active: t("active"), inactive: t("inactive"), deleted: t("archived") }[customer.status]
        : "";

    return (
        <Dialog open={customerId !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{customer ? customer.displayName : t("detailsTitle")}</DialogTitle>
                </DialogHeader>

                {isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}

                {isError && <p className="text-sm text-destructive">{t("detailsError")}</p>}

                {customer && (
                    <div className="space-y-6">
                        <div className="flex min-w-0 items-center gap-4">
                            <CustomerAvatar
                                image={customer.image}
                                displayName={customer.displayName}
                                initials={customer.initials}
                                className="size-16"
                            />
                            <div className="min-w-0 space-y-1">
                                <p className="truncate font-medium">{customer.displayName}</p>
                                {/* The display name is the company when there is one, so the
                                    person's own name is worth showing under it. */}
                                {customer.companyName && (
                                    <p className="truncate text-sm text-muted-foreground">
                                        {[customer.firstName, customer.lastName].filter(Boolean).join(" ")}
                                    </p>
                                )}
                                <CustomerStatusBadge status={customer.status} label={statusLabel} />
                            </div>
                        </div>

                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-lg border p-4 text-sm">
                            <DetailLabel icon={<Mail className="size-4" />}>{t("colEmail")}</DetailLabel>
                            <dd className="min-w-0">
                                <a
                                    href={`mailto:${customer.email}`}
                                    title={customer.email}
                                    className="block break-all hover:underline"
                                >
                                    {customer.email}
                                </a>
                            </dd>

                            <DetailLabel icon={<Phone className="size-4" />}>{t("colPhone")}</DetailLabel>
                            <dd className="min-w-0 truncate">
                                {customer.phone ? (
                                    <a href={`tel:${customer.phone}`} className="hover:underline">
                                        {customer.phone}
                                    </a>
                                ) : (
                                    "—"
                                )}
                            </dd>

                            <DetailLabel icon={<Building2 className="size-4" />}>{t("colCompany")}</DetailLabel>
                            <dd className="min-w-0 truncate">{customer.companyName ?? "—"}</dd>

                            <DetailLabel icon={<Receipt className="size-4" />}>{t("taxNumber")}</DetailLabel>
                            <dd className="min-w-0 truncate">{customer.taxNumber ?? "—"}</dd>

                            <DetailLabel icon={<CalendarDays className="size-4" />}>{t("colJoined")}</DetailLabel>
                            <dd className="min-w-0">{formatDateTime(customer.createdAt)}</dd>

                            <DetailLabel icon={<Hash className="size-4" />}>{t("customerId")}</DetailLabel>
                            <dd className="min-w-0">{customer.id}</dd>
                        </dl>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailLabel({ icon, children }: { readonly icon: React.ReactNode; readonly children: React.ReactNode }) {
    return (
        <dt className="flex items-center gap-2 text-muted-foreground">
            {icon} {children}
        </dt>
    );
}
