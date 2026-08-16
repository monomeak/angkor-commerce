"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentCustomer } from "../hooks/use-current-customer";

/**
 * Client-side gate. The session cookies are httpOnly and scoped to the API origin, so
 * Next middleware can't see them — asking GET /me is the only way to know.
 */
export function RequireCustomer({ children }: { readonly children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: customer, isPending } = useCurrentCustomer();

    useEffect(() => {
        if (!isPending && !customer) {
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
    }, [customer, isPending, pathname, router]);

    if (isPending) {
        return (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!customer) {
        return null;
    }

    return <>{children}</>;
}
