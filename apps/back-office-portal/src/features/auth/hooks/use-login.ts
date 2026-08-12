"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { loginRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import type { LoginPayload } from "../types/auth";

/**
 * useMutation gives us isPending, isError/error, and reset() for free. core-api sets
 * the session cookies on the response, so there is nothing to persist here — we just
 * invalidate ["auth", "me"] so useCurrentUser refetches the full profile (login
 * returns AuthenticatedUserResponse, which omits phone/status).
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationKey: authKeys.login(),
        mutationFn: (payload: LoginPayload) => loginRequest(apiBaseUrl, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    });
}
