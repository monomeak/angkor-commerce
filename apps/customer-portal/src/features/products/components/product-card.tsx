"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { WishlistButton } from "@/src/features/wishlist/components/wishlist-button";
import { productDetailHref } from "../lib/product-helpers";
import { productImageSrc } from "../lib/product-image";
import { applyDiscount, formatPrice } from "../lib/pricing";
import type { ProductSummary } from "../types/product";

type ProductCardProps = {
    readonly product: ProductSummary;
    readonly className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
    const { mediaBaseUrl, locale } = useAppConfig();
    const hasDiscount = product.discountPercentage > 0;
    const discountedPrice = applyDiscount(product.price, product.discountPercentage);
    // Real count from the API, unlike the sizes themselves — enough to tell a shopper whether
    // there is a choice waiting on the detail page.
    const sizeCount = product.variantCount;
    const detailHref = productDetailHref(product.categorySlug, product.id);
    const thumbnailSrc = productImageSrc(mediaBaseUrl, product.thumbnail, product.name);
    const isSoldOut = product.totalStock <= 0;

    return (
        <Card
            className={cn(
                "gap-4 p-3 transition-transform duration-300 hover:-translate-y-1 hover:ring-primary/50",
                className
            )}
        >
            {/*
             * The heart is a sibling of the link, not a child of it. Nesting a button inside an
             * anchor is invalid HTML and left the heart cancelling a navigation on every tap.
             */}
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted to-muted/40">
                <Link href={detailHref ?? "#"} className="absolute inset-0">
                    <Image
                        src={thumbnailSrc}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                        unoptimized
                    />
                </Link>
                {hasDiscount && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        -{product.discountPercentage}%
                    </Badge>
                )}
                <WishlistButton productId={product.id} productName={product.name} className="absolute top-2 right-2" />
            </div>

            <div className="flex flex-col gap-3 px-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">
                        <Link href={detailHref ?? "#"} className="hover:underline">
                            {product.name}
                        </Link>{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                            ({product.rating.toFixed(1)}
                            <Star className="mb-0.5 ml-0.5 inline size-3 fill-current" />)
                        </span>
                    </h3>
                    <div className="flex shrink-0 flex-col items-end">
                        <span className="text-lg font-bold">
                            {formatPrice(discountedPrice, product.currency, locale)}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.price, product.currency, locale)}
                            </span>
                        )}
                    </div>
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

                {/*
                 * Sizes used to be guessed from the category name and picked right here. They
                 * live on variants, which the list endpoint does not return — so choosing one
                 * happens on the detail page, where the real SKUs and their stock are known.
                 * Adding to the cart from a grid would otherwise book a size that may not exist.
                 */}
                <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    nativeButton={false}
                    disabled={isSoldOut || !detailHref}
                    render={<Link href={detailHref ?? "#"} />}
                >
                    {isSoldOut ? "Sold out" : sizeCount > 1 ? `Choose from ${sizeCount} sizes` : "View product"}
                </Button>
            </div>
        </Card>
    );
}
