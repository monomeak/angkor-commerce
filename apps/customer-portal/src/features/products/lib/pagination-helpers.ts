/** Products shown per page on the category and search grids. */
export const PRODUCTS_PAGE_SIZE = 8;

// Collapses a long page run into first/last + a window around the current
// page, e.g. [1, "ellipsis", 4, 5, 6, "ellipsis", 20].
export function getPageRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const delta = 1;
  const pages: number[] = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= delta) {
      pages.push(page);
    }
  }

  const range: (number | "ellipsis")[] = [];
  let previous = 0;
  for (const page of pages) {
    if (previous && page - previous > 1) {
      range.push("ellipsis");
    }
    range.push(page);
    previous = page;
  }

  return range;
}

/**
 * The requested page, floored at 1. It cannot be clamped to the last page here any more:
 * the total only comes back with the results, and the page number is what decides `skip` on
 * the request that fetches them. Callers clamp for display once they have the total.
 */
export function resolvePage(pageParam: string | undefined): number {
  const requested = Number(pageParam);
  return Math.max(Number.isFinite(requested) ? Math.trunc(requested) : 1, 1);
}
