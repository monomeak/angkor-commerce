"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { CustomersTable } from "../components/customers-table";
import { CustomerDetailsDialog } from "../components/customer-details-dialog";
import { useCustomers } from "../hooks/use-customers";
import { useDebouncedValue } from "@/src/shared/hooks/use-debounced-value";
import { CustomersToolbar } from "../components/customers-toolbar";
import { PaginationControls } from "@/lib/pagination-control";

// const PAGE_SIZE = 10;

export function CustomersListView() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const { data, isLoading, isError, error, isFetching } = useCustomers({
    search: debouncedSearch,
    page,
    pageSize: pageSize,
  });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };
  const handleResetFilters = () => {
    setSearchInput("");
  };

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Couldn&apos;t load customers{error ? `: ${error.message}` : "."} Please try
        again.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <CustomersToolbar
        search={searchInput}
        onSearchChange={handleSearchChange}
        onReset={handleResetFilters}
      />

      <Card>
        <CardContent className="p-0">
          <CustomersTable
            customers={data?.customers ?? []}
            isLoading={isLoading || isFetching}
            onViewDetails={setSelectedCustomerId}
          ></CustomersTable>
        </CardContent>
      </Card>
      <PaginationControls
        currentPage={page}
        pageCount={pageCount}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        itemLabel="customer"
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
      <CustomerDetailsDialog
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}
