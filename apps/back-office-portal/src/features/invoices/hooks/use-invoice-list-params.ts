"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
    buildInvoiceSearchParams,
    getCurrentPage,
    parseInvoiceSearchParams,
    type InvoiceFilterPatch
} from "../lib/search-params";
import type { InvoiceListParams } from "../types/invoice";

/**
 * The list's entire state — search, status, customer, both date ranges, sort and page — lives
 * in the URL, so a filtered view survives a refresh and can be pasted to a colleague.
 *
 * router.replace, not push: filtering is not navigation, and push would make the back button
 * walk through every keystroke of a search.
 */
export function useInvoiceListParams(): {
    params: InvoiceListParams;
    page: number;
    setParams: (patch: InvoiceFilterPatch) => void;
} {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const params = useMemo(
        () => parseInvoiceSearchParams(new URLSearchParams(searchParams.toString())),
        [searchParams]
    );

    const setParams = useCallback(
        (patch: InvoiceFilterPatch) => {
            const next = buildInvoiceSearchParams(new URLSearchParams(searchParams.toString()), patch);
            const query = next.toString();

            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    return { params, page: getCurrentPage(params), setParams };
}
