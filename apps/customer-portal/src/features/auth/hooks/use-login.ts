"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { loginRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import { resetSessionCache } from "../lib/session-cache";
import type { AuthCustomer, CurrentCustomer, LoginPayload } from "../types/auth";

/** Login/register return the leaner AuthenticatedCustomerResponse; /me fills in the rest. */
export function seedCurrentCustomer(customer: AuthCustomer): CurrentCustomer {
    return { ...customer, image: null, status: "ACTIVE" };
}

export function useLogin() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginRequest(apiBaseUrl, payload),
        onSuccess: (customer) => {
            // Seed so the guard doesn't bounce us mid-redirect, then refetch for image/status.
            resetSessionCache(queryClient, seedCurrentCustomer(customer));
            void queryClient.invalidateQueries({ queryKey: authKeys.currentCustomer() });
        }
    });
}
