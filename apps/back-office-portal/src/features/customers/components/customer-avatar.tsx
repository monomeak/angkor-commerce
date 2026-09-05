"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { resolveMediaUrl } from "@/lib/media";

interface CustomerAvatarProps {
    /** Raw MinIO object key from the API, or null for a customer who never uploaded one. */
    readonly image: string | null;
    readonly displayName: string;
    readonly initials: string;
    readonly className?: string;
}

/** Resolves the object key itself, so callers pass what the API gave them and nothing else. */
export function CustomerAvatar({ image, displayName, initials, className }: CustomerAvatarProps) {
    const { mediaBaseUrl } = useAppConfig();

    return (
        <Avatar className={className}>
            <AvatarImage src={resolveMediaUrl(mediaBaseUrl, image)} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
    );
}
