"use client";

import { useQuery } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCurrentCustomer } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import type { CurrentCustomer } from "../types/auth";

/**
 * The session lives in httpOnly cookies, so the API is the only source of truth for
 * "am I signed in". `null` data means anonymous; `undefined` means we don't know yet.
 */
export function useCurrentCustomer() {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<CurrentCustomer | null>({
        queryKey: authKeys.currentCustomer(),
        queryFn: () => fetchCurrentCustomer(apiBaseUrl),
        staleTime: 5 * 60 * 1000,
        retry: false
    });
}

export function useAuthSession() {
    const { data, isPending, isError } = useCurrentCustomer();

    return {
        customer: data ?? null,
        isAuthenticated: Boolean(data),
        isResolving: isPending,
        isError
    };
}
