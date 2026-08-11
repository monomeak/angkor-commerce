"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { registerRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import type { RegisterPayload } from "../types/auth";
import { seedCurrentCustomer } from "./use-login";

/** Registration signs the customer in — core-api sets the same cookie pair as login. */
export function useRegister() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => registerRequest(apiBaseUrl, payload),
        onSuccess: (customer) => {
            queryClient.setQueryData(authKeys.currentCustomer(), seedCurrentCustomer(customer));
            void queryClient.invalidateQueries({ queryKey: authKeys.currentCustomer() });
        }
    });
}
