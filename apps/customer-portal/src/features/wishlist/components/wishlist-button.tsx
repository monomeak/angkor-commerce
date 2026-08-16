"use client";

import { Heart, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useAuthSession } from "@/src/features/auth/hooks/use-current-customer";
import { useWishlistToggle } from "../hooks/use-wishlist-mutations";

type WishlistButtonProps = {
    readonly productId: number;
    /** Named in the accessible label, so a screen reader hears which product is being saved. */
    readonly productName: string;
    /** `overlay` floats on a product image; `inline` sits in a row of buttons. */
    readonly variant?: "overlay" | "inline";
    readonly className?: string;
};

/**
 * The heart. Saved state is not a prop — every heart reads the same cached id list, so saving
 * a product on its detail page fills the heart on the grid behind it too.
 */
export function WishlistButton({ productId, productName, variant = "overlay", className }: WishlistButtonProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isResolving } = useAuthSession();
    const { isWishlisted, isPending, error, toggle } = useWishlistToggle(productId);

    // An anonymous tap is a sign-in prompt, not a request that would 401.
    function handleClick() {
        if (!isAuthenticated) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return;
        }

        toggle();
    }

    const label = isWishlisted ? `Remove ${productName} from favorites` : `Save ${productName} to favorites`;
    const isOverlay = variant === "overlay";

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                // Until /me answers, a tap would either 401 or bounce a signed-in shopper to login.
                disabled={isResolving || isPending}
                aria-pressed={isWishlisted}
                aria-label={label}
                title={label}
                className={cn(
                    "flex items-center justify-center transition-colors disabled:opacity-60",
                    isOverlay
                        ? "size-8 rounded-full bg-background/80 text-muted-foreground shadow-sm hover:text-destructive"
                        : "h-12 gap-2 rounded-full border px-5 text-sm font-medium hover:border-destructive hover:text-destructive",
                    className
                )}
            >
                {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
                )}
                {!isOverlay && (isWishlisted ? "Saved" : "Save for later")}
            </button>

            {/* No room for a sentence on a grid tile, so the overlay announces it and snaps back. */}
            {error && (
                <p role="status" className={cn("text-sm text-destructive", isOverlay && "sr-only")}>
                    {error instanceof ApiError ? error.displayMessage : "Could not update your favorites."}
                </p>
            )}
        </>
    );
}
