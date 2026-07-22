"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerAvatar } from "./customer-avatar";
import { useCustomerDetails } from "../hooks/use-customer-details";
import {
  Building2,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

interface CustomerDetailsDialogProps {
  readonly customerId: number | null;
  readonly onClose: () => void;
}

export function CustomerDetailsDialog({
  customerId,
  onClose,
}: CustomerDetailsDialogProps) {
  const { data: customer, isLoading, isError } = useCustomerDetails(customerId);
  return (
    <Dialog
      open={customerId !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>{customer ? customer.fullName : "Customer"}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading customer details...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-600">
            Could not load this customer. Please try again.
          </p>
        )}

        {customer && (
          <div className="space-y-6">
            <div className="flex min-w-0 items-center gap-4">
              <CustomerAvatar
                avatarUrl={customer.avatarUrl}
                fullName={customer.fullName}
                initials={customer.initials}
                className="size-16"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{customer.fullName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {customer.company.title}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-lg border p-4 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> Email
              </dt>
              <dd className="min-w-0">
                <a
                  href={`mailto:${customer.email}`}
                  title={customer.email}
                  className="block break-all hover:underline"
                >
                  {customer.email}
                </a>
              </dd>

              <dt className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> Phone
              </dt>
              <dd className="min-w-0 truncate">
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              </dd>

              <dt className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4" /> Company
              </dt>
              <dd className="min-w-0 truncate" title={customer.company.name}>
                {customer.company.name}
              </dd>

              <dt className="flex items-center gap-2 text-muted-foreground">
                <BriefcaseBusiness className="size-4" /> Department
              </dt>
              <dd className="min-w-0 truncate">
                {customer.company.department}
              </dd>

              <dt className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" /> Location
              </dt>
              <dd className="min-w-0 break-all">
                {customer.location.city}, {customer.location.state},{" "}
                {customer.location.country}
              </dd>
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
