"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomersToolbarProps {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly onReset: () => void;
}

export function CustomersToolbar({
  search,
  onSearchChange,
  onReset,
}: CustomersToolbarProps) {
  const hasSearch = search.trim().length > 0;

  return (
    <div className="flex flex-row justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customers by name, email..."
          className="pl-9"
        />
      </div>
      {hasSearch && (
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw />
          Reset filters
        </Button>
      )}
    </div>
  );
}
