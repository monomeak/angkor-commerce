"use client";

// reusable pagination control component
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readonly } from "zod";

interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function PaginationControls({
  currentPage,
  pageCount,
  total,
  pageSize,
  onPageChange,
  itemLabel = "item",
}: PaginationControlsProps) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total} {itemLabel}
        {total !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="min-w-[80px] text-center text-sm text-muted-foreground">
          Page {currentPage} of {pageCount}
        </span>

        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
