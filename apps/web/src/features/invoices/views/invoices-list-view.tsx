"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { InvoiceDetailsDialog } from "../components/invoice-details-dialog";
import { useInvoiceList } from "../hooks/use-invoice-list";
import type { InvoiceStatus } from "../types/invoice";
import { PaginationControls } from "@/lib/pagination-control";
import { useDebouncedValue } from "@/src/shared/hooks/use-debounced-value";
import { InvoiceToolbar } from "../components/invoices-toolbar";
import { InvoicesTable } from "../components/invoices-table";
export function InvoicesListView() {
  // Handle search input
  const [searchInput, setSearchInput] = useState("");

  // Handle status selected
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [issuedDateFrom, setIssuedDateFrom] = useState("");
  const [issuedDateTo, setIssuedDateTo] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  // Handle page navigation
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Handle Selected InvoiceId

  const [selectedInvoiceId, setSeletedInvoiceId] = useState<string | null>(
    null,
  );

  // add debounced Search for ux

  const debouncedSearch = useDebouncedValue(searchInput, 250);

  const { invoices, total, pageCount, currentPage, isLoading, isError, error } =
    useInvoiceList({
      search: debouncedSearch,
      status,
      issuedDateFrom,
      issuedDateTo,
      dueDateFrom,
      dueDateTo,
      page,
      pageSize,
    });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // reset to page 1 after search change / status filtering updated
    setPage(1);
  };

  const handleStatusChange = (value: InvoiceStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatus("all");
    setIssuedDateFrom("");
    setIssuedDateTo("");
    setDueDateFrom("");
    setDueDateTo("");
    setPage(1);
  };

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load invoices{error ? `: ${error.message}` : "."} Please try
        again.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <InvoiceToolbar
        search={searchInput}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        issuedDateFrom={issuedDateFrom}
        issuedDateTo={issuedDateTo}
        dueDateFrom={dueDateFrom}
        dueDateTo={dueDateTo}
        onIssuedDateFromChange={(value) => {
          setIssuedDateFrom(value);
          setPage(1);
        }}
        onIssuedDateToChange={(value) => {
          setIssuedDateTo(value);
          setPage(1);
        }}
        onDueDateFromChange={(value) => {
          setDueDateFrom(value);
          setPage(1);
        }}
        onDueDateToChange={(value) => {
          setDueDateTo(value);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />
      <Card>
        <CardContent className="p-0">
          <InvoicesTable
            invoices={invoices}
            isLoading={isLoading}
            onViewDetails={setSeletedInvoiceId}
          />
        </CardContent>
      </Card>

      <PaginationControls
        currentPage={currentPage}
        pageCount={pageCount}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        itemLabel="invoice"
      />
      <InvoiceDetailsDialog
        invoiceId={selectedInvoiceId}
        onClose={() => setSeletedInvoiceId(null)}
      />
    </div>
  );
}
