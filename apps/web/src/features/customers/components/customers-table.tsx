"use client";

import { Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerAvatar } from "./customer-avatar";
import type { Customer } from "../types/customer";

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  onViewDetails: (customerId: number) => void;
}

export function CustomersTable({
  customers,
  isLoading,
  onViewDetails,
}: CustomersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="w-[220px]">Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              Loading customers...
            </TableCell>
          </TableRow>
        )}

        {!isLoading && customers.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              No customers match your search.
            </TableCell>
          </TableRow>
        )}
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <CustomerAvatar
                  avatarUrl={customer.avatarUrl}
                  fullName={customer.fullName}
                  initials={customer.initials}
                  className="size-9"
                />
                <span className="font-medium">{customer.fullName}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-[220px] text-sm text-muted-foreground">
              <div className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <a
                  href={`mailto:${customer.email}`}
                  title={customer.email}
                  className="truncate hover:text-foreground hover:underline"
                >
                  {customer.email}
                </a>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {customer.phone}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-sm">{customer.company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {customer.company.title}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {customer.location.city}, {customer.location.stateCode}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`View details for ${customer.fullName}`}
                onClick={() => onViewDetails(customer.id)}
              >
                <Eye className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
