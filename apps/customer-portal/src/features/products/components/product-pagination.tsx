import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPageRange } from "../lib/pagination-helpers";

type ProductPaginationProps = {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly buildHref: (page: number) => string;
};

export function ProductPagination({ currentPage, totalPages, buildHref }: ProductPaginationProps) {
  const pageRange = getPageRange(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildHref(Math.max(currentPage - 1, 1))}
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
            className={isFirstPage ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pageRange.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink href={buildHref(page)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={buildHref(Math.min(currentPage + 1, totalPages))}
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
            className={isLastPage ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
