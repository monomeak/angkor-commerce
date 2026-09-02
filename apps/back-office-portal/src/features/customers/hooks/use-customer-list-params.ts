"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
    buildCustomerSearchParams,
    getCurrentPage,
    parseCustomerSearchParams,
    type CustomerFilterPatch
} from "../lib/search-params";
import type { CustomerListParams } from "../types/customer";

/**
 * The list's entire state — search, status, sort, page — lives in the URL, so it survives a
 * refresh and can be pasted to a colleague (AGENTS.md).
 *
 * Updates use router.replace, not push: paging and filtering are not navigation, and push
 * would make the back button walk through every keystroke of a search.
 */
export function useCustomerListParams(): {
    params: CustomerListParams;
    page: number;
    setParams: (patch: CustomerFilterPatch) => void;
} {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const params = useMemo(
        () => parseCustomerSearchParams(new URLSearchParams(searchParams.toString())),
        [searchParams]
    );

    const setParams = useCallback(
        (patch: CustomerFilterPatch) => {
            const next = buildCustomerSearchParams(new URLSearchParams(searchParams.toString()), patch);
            const query = next.toString();

            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    return { params, page: getCurrentPage(params), setParams };
}
