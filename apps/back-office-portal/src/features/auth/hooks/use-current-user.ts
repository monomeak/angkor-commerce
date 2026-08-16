"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { fetchCurrentUser } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import type { CurrentUser } from "../types/auth";

/**
 * The session lives in httpOnly cookies, so the client cannot read it directly —
 * /auth/me is the only source of truth, and `null` is its legitimate "signed out"
 * answer rather than an error. That replaces the old localStorage rehydration
 * dance, which needed an effect to avoid a hydration mismatch.
 */
export function useCurrentUser() {
    const { apiBaseUrl } = useAppConfig();

    return useQuery<CurrentUser | null>({
        queryKey: authKeys.currentUser(),
        queryFn: () => fetchCurrentUser(apiBaseUrl),
        staleTime: 5 * 60 * 1000, // 5 min — avoid refetching on every mount
        // apiFetch already refreshes once on a 401; a retry here would only repeat
        // a request that has genuinely been rejected.
        retry: false
    });
}
