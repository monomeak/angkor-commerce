"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { ImageUp, Loader2, Pencil, Trash2, User } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { ApiError } from "@/lib/api-client";
import { resolveMediaUrl } from "@/lib/media";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useUpdateProfile, useUploadProfileImage } from "@/src/features/auth/hooks/use-update-profile";
import { getInitials, prepareAvatarFile } from "../lib/avatar-image";

export function AccountAvatar() {
    const { data: customer } = useCurrentCustomer();
    const uploadImage = useUploadProfileImage();
    const updateProfile = useUpdateProfile();
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPreparing, setIsPreparing] = useState(false);

    const initials = getInitials(customer?.firstName ?? "", customer?.lastName ?? "");
    const { mediaBaseUrl } = useAppConfig();
    const imageUrl = resolveMediaUrl(mediaBaseUrl, customer?.image);
    const isBusy = isPreparing || uploadImage.isPending || updateProfile.isPending;

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // Reset so picking the same file again still fires a change event.
        event.target.value = "";

        if (!file) {
            return;
        }

        setError(null);
        setIsPreparing(true);

        let prepared;
        try {
            prepared = await prepareAvatarFile(file);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not read that image.");
            return;
        } finally {
            setIsPreparing(false);
        }

        uploadImage.mutate(
            { image: prepared.blob, fileName: prepared.fileName },
            {
                onError: (cause) => {
                    setError(cause instanceof ApiError ? cause.displayMessage : "Upload failed. Try again.");
                }
            }
        );
    }

    function handleRemove() {
        setError(null);
        // No delete endpoint — PATCH /me writes the image field, and "" clears it.
        updateProfile.mutate(
            { image: "" },
            {
                onError: (cause) => {
                    setError(cause instanceof ApiError ? cause.displayMessage : "Could not remove the photo.");
                }
            }
        );
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <div className="relative size-28 overflow-hidden rounded-full bg-muted text-muted-foreground ring-1 ring-border sm:size-36">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt=""
                            fill
                            unoptimized
                            sizes="144px"
                            className="object-cover"
                        />
                    ) : (
                        <span className="flex size-full items-center justify-center text-3xl font-semibold sm:text-4xl">
                            {initials || <User className="size-10" />}
                        </span>
                    )}

                    {isBusy && (
                        <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-background">
                            <Loader2 className="size-6 animate-spin" />
                        </span>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        disabled={isBusy || !customer}
                        aria-label="Edit profile photo"
                        className="absolute right-0 bottom-1 flex size-9 items-center justify-center rounded-full bg-background text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
                    >
                        <Pencil className="size-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" sideOffset={6} className="w-auto min-w-40">
                        <DropdownMenuItem onClick={() => inputRef.current?.click()}>
                            <ImageUp />
                            {customer?.image ? "Change photo" : "Upload photo"}
                        </DropdownMenuItem>

                        {customer?.image && (
                            <DropdownMenuItem variant="destructive" onClick={handleRemove}>
                                <Trash2 />
                                Remove photo
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {error && <p className="text-center text-sm text-destructive">{error}</p>}
        </div>
    );
}
