"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { logoutRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";

export function useAuthSession() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    /**
     * Only the API can clear httpOnly cookies, so this has to round-trip — and callers
     * must await it before redirecting, or proxy.ts will still see a live session on
     * /login and bounce them straight back in. A failed request still clears the local
     * cache: the user asked to sign out, so the UI must not keep showing them signed in.
     */
    const logout = async (): Promise<void> => {
        try {
            await logoutRequest(apiBaseUrl);
        } finally {
            queryClient.removeQueries({ queryKey: authKeys.all });
        }
    };

    return { logout };
}
