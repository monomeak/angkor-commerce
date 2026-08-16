"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { logoutRequest } from "../api/auth-api";
import { resetSessionCache } from "../lib/session-cache";

export function useLogout() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: () => logoutRequest(apiBaseUrl),
        // onSettled, not onSuccess: if the call failed we still drop the local session
        // rather than leaving the UI claiming to be signed in.
        onSettled: () => resetSessionCache(queryClient, null)
    });
}

/**
 * What every logout control should use. Leaving first matters: dropping the session while an
 * account page is mounted lets `RequireCustomer` bounce it to /login and win the race.
 */
export function useLogoutAndLeave() {
    const router = useRouter();
    const logout = useLogout();

    return {
        isPending: logout.isPending,
        logout: () => {
            if (logout.isPending) {
                return;
            }

            router.push("/");
            logout.mutate();
        }
    };
}
