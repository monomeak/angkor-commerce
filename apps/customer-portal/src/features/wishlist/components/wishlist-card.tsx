"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { productDetailHref } from "@/src/features/products/lib/product-helpers";
import { productImageSrc } from "@/src/features/products/lib/product-image";
import { applyDiscount, formatPrice } from "@/src/features/products/lib/pricing";
import type { WishlistItem } from "../types/wishlist";

type WishlistCardProps = {
    readonly item: WishlistItem;
    readonly onRemove: () => void;
    /** The removal for this row is in flight — the API owns the outcome, so wait for it. */
    readonly isBusy?: boolean;
};

/**
 * One saved product. Not a `ProductCard`: that takes a `ProductSummary` this row cannot fill.
 * A saved product can outlive the catalogue, so an inactive one says so and drops its link.
 */
export function WishlistCard({ item, onRemove, isBusy = false }: WishlistCardProps) {
    const { mediaBaseUrl, locale } = useAppConfig();

    const isAvailable = item.productStatus === "active";
    const isSoldOut = item.totalStock <= 0;
    const href = isAvailable ? productDetailHref(item.categorySlug, item.productId) : undefined;

    const hasDiscount = item.discountPercentage > 0;
    const payablePrice = applyDiscount(item.price, item.discountPercentage);
    const thumbnailSrc = productImageSrc(mediaBaseUrl, item.thumbnail, item.title);

    return (
        <Card className={cn("gap-4 p-3", isBusy && "opacity-60")}>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/40">
                <ImageFrame href={href}>
                    <Image
                        src={thumbnailSrc}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={cn("object-cover", !isAvailable && "grayscale")}
                        unoptimized
                    />
                </ImageFrame>

                {hasDiscount && isAvailable && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        -{item.discountPercentage}%
                    </Badge>
                )}

                <button
                    type="button"
                    onClick={onRemove}
                    disabled={isBusy}
                    aria-label={`Remove ${item.title} from favorites`}
                    className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-50"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 px-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">
                        {href ? (
                            <Link href={href} className="hover:underline">
                                {item.title}
                            </Link>
                        ) : (
                            item.title
                        )}
                    </h3>
                    <div className="flex shrink-0 flex-col items-end">
                        <span className="text-lg font-bold">{formatPrice(payablePrice, item.currency, locale)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(item.price, item.currency, locale)}
                            </span>
                        )}
                    </div>
                </div>

                {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}

                <div className="mt-auto">
                    <Button
                        variant="accent"
                        size="lg"
                        className="w-full"
                        nativeButton={false}
                        disabled={!href || isSoldOut}
                        render={<Link href={href ?? "#"} />}
                    >
                        {/* Never "add to cart": size and stock live on variants this row does not carry. */}
                        {!isAvailable ? "No longer available" : isSoldOut ? "Sold out" : "View product"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

function ImageFrame({ href, children }: { readonly href?: string; readonly children: React.ReactNode }) {
    if (!href) {
        return <>{children}</>;
    }

    return (
        <Link href={href} className="absolute inset-0">
            {children}
        </Link>
    );
}
