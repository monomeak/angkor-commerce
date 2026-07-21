"use client";

import { format, parseISO } from "date-fns";
import { RotateCcw, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/date-picker-with-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceStatus } from "../types/invoice";
import {
  ALL_INVOICE_STATUSES,
  getStatusStyle,
} from "../lib/invoice-status-style";

interface InvoicesToolbarProps {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly status: InvoiceStatus | "all";
  readonly onStatusChange: (value: InvoiceStatus | "all") => void;
  readonly issuedDateFrom: string;
  readonly issuedDateTo: string;
  readonly dueDateFrom: string;
  readonly dueDateTo: string;
  readonly onIssuedDateFromChange: (value: string) => void;
  readonly onIssuedDateToChange: (value: string) => void;
  readonly onDueDateFromChange: (value: string) => void;
  readonly onDueDateToChange: (value: string) => void;
  readonly onReset: () => void;
}

export function InvoiceToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  issuedDateFrom,
  issuedDateTo,
  dueDateFrom,
  dueDateTo,
  onIssuedDateFromChange,
  onIssuedDateToChange,
  onDueDateFromChange,
  onDueDateToChange,
  onReset,
}: InvoicesToolbarProps) {
  const hasActiveFilters =
    search.trim().length > 0 ||
    status !== "all" ||
    Boolean(issuedDateFrom || issuedDateTo || dueDateFrom || dueDateTo);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search invoice #, client name or email..."
            className="pl-9"
          />
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Select
            value={status}
            onValueChange={(value) =>
              onStatusChange(value as InvoiceStatus | "all")
            }
          >
            <SelectTrigger className="min-w-0 flex-1 sm:w-[140px] sm:flex-none">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_INVOICE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {getStatusStyle(s).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button type="button" variant="outline" onClick={onReset}>
              <RotateCcw />
              Reset filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <DateRangeFilter
          label="Issue date"
          from={issuedDateFrom}
          to={issuedDateTo}
          onFromChange={onIssuedDateFromChange}
          onToChange={onIssuedDateToChange}
        />
        <DateRangeFilter
          label="Due date"
          from={dueDateFrom}
          to={dueDateTo}
          onFromChange={onDueDateFromChange}
          onToChange={onDueDateToChange}
        />
      </div>
    </div>
  );
}

interface DateRangeFilterProps {
  readonly label: string;
  readonly from: string;
  readonly to: string;
  readonly onFromChange: (value: string) => void;
  readonly onToChange: (value: string) => void;
}

function DateRangeFilter({
  label,
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  const inputId = label.toLowerCase().replace(" ", "-");
  const date: DateRange | undefined =
    from || to
      ? {
          from: from ? parseISO(from) : undefined,
          to: to ? parseISO(to) : undefined,
        }
      : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    onFromChange(range?.from ? format(range.from, "yyyy-MM-dd") : "");
    onToChange(range?.to ? format(range.to, "yyyy-MM-dd") : "");
  };

  return (
    <DatePickerWithRange
      id={inputId}
      label={label}
      value={date}
      onChange={handleSelect}
    />
  );
}
