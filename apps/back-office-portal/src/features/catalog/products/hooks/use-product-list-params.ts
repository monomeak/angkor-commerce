"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
    buildProductSearchParams,
    getCurrentPage,
    parseProductSearchParams,
    type ProductFilterPatch
} from "../lib/search-params";
import type { ProductListParams } from "../types/product";

/**
 * The list's entire state — filters, sort, page — lives in the URL, so it survives a
 * refresh and can be pasted to someone else (AGENTS.md).
 *
 * Updates use router.replace, not push: paging and filtering are not navigation, and
 * push would make the back button walk through every keystroke of a search.
 */
export function useProductListParams(): {
    params: ProductListParams;
    page: number;
    setParams: (patch: ProductFilterPatch) => void;
} {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const params = useMemo(
        () => parseProductSearchParams(new URLSearchParams(searchParams.toString())),
        [searchParams]
    );

    const setParams = useCallback(
        (patch: ProductFilterPatch) => {
            const next = buildProductSearchParams(new URLSearchParams(searchParams.toString()), patch);
            const query = next.toString();

            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    return { params, page: getCurrentPage(params), setParams };
}
