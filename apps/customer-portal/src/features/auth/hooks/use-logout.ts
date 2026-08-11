"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { logoutRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";

export function useLogout() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: () => logoutRequest(apiBaseUrl),
        // onSettled, not onSuccess: if the call failed we still drop the local session
        // rather than leaving the UI claiming to be signed in.
        onSettled: () => {
            queryClient.setQueryData(authKeys.currentCustomer(), null);
        }
    });
}
