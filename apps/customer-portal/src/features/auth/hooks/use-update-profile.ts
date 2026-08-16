"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { updateProfileRequest, uploadProfileImageRequest } from "../api/auth-api";
import { authKeys } from "../lib/query-keys";
import type { CurrentCustomer, UpdateProfilePayload } from "../types/auth";

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) => updateProfileRequest(apiBaseUrl, payload),
        onSuccess: (customer: CurrentCustomer) => {
            queryClient.setQueryData(authKeys.currentCustomer(), customer);
        }
    });
}

export function useUploadProfileImage() {
    const queryClient = useQueryClient();
    const { apiBaseUrl } = useAppConfig();

    return useMutation({
        mutationFn: ({ image, fileName }: { image: Blob; fileName: string }) =>
            uploadProfileImageRequest(apiBaseUrl, image, fileName),
        onSuccess: (customer: CurrentCustomer) => {
            queryClient.setQueryData(authKeys.currentCustomer(), customer);
        }
    });
}
