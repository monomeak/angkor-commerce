"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { WishlistButton } from "@/src/features/wishlist/components/wishlist-button";
import { toCartLine } from "../lib/cart-line";
import { productGallery } from "../lib/product-image";
import { applyDiscount, formatPrice } from "../lib/pricing";
import { pickDefaultVariant, variantLabel } from "../lib/variants";
import type { Product } from "../types/product";

type ProductDetailProps = {
    readonly product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
    const { mediaBaseUrl, locale } = useAppConfig();
    const { addItem } = useCart();

    /*
     * The variant is the thing actually being bought: it owns the SKU, the stock and — when
     * priceOverride is set — the price. Everything below reads from the selected one rather
     * than from the product, which only carries a base price and a summed stock.
     */
    const [selectedVariantId, setSelectedVariantId] = useState(() => pickDefaultVariant(product.variants)?.id);
    const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    const gallery = productGallery(mediaBaseUrl, product.images, product.name);
    const hasDiscount = product.discountPercentage > 0;
    const listPrice = selectedVariant?.price ?? product.price;
    const payablePrice = applyDiscount(listPrice, product.discountPercentage);

    const stock = selectedVariant?.stock ?? product.totalStock;
    const isSoldOut = stock <= 0;
    // Only worth showing a size picker when the variants are actually distinguishable —
    // a single-variant product has size null and would render one blank button.
    const showSizes = product.variants.length > 1 || Boolean(product.variants[0]?.size);

    return (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted/40">
                    <Image
                        src={gallery[activeImage] ?? gallery[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    {hasDiscount && (
                        <Badge variant="destructive" className="absolute top-3 left-3">
                            -{product.discountPercentage}%
                        </Badge>
                    )}
                </div>

                {gallery.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {gallery.map((src, index) => (
                            <button
                                key={src}
                                type="button"
                                onClick={() => setActiveImage(index)}
                                aria-label={`Show image ${index + 1}`}
                                aria-pressed={index === activeImage}
                                className={cn(
                                    "relative size-16 overflow-hidden rounded-lg border transition-colors",
                                    index === activeImage ? "border-primary" : "border-border hover:border-primary/50"
                                )}
                            >
                                <Image src={src} alt="" fill sizes="64px" className="object-cover" unoptimized />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{product.category?.name}</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">{product.name}</h1>
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="size-4 fill-current text-accent" />
                        {product.rating.toFixed(1)}
                    </div>
                </div>

                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">{formatPrice(payablePrice, product.currency, locale)}</span>
                    {hasDiscount && (
                        <span className="text-lg text-muted-foreground line-through">
                            {formatPrice(listPrice, product.currency, locale)}
                        </span>
                    )}
                </div>

                {product.description && <p className="text-muted-foreground">{product.description}</p>}

                {showSizes && (
                    <div>
                        <p className="mb-2 text-sm font-medium">What is your size?</p>
                        <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant) => {
                                const isOutOfStock = variant.stock <= 0;

                                return (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        disabled={isOutOfStock}
                                        onClick={() => {
                                            setSelectedVariantId(variant.id);
                                            // A quantity carried over from a roomier variant
                                            // would exceed this one's stock.
                                            setQuantity(1);
                                        }}
                                        aria-pressed={variant.id === selectedVariantId}
                                        title={isOutOfStock ? "Out of stock" : undefined}
                                        className={cn(
                                            "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
                                            isOutOfStock && "cursor-not-allowed text-muted-foreground/50 line-through",
                                            variant.id === selectedVariantId
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                                        )}
                                    >
                                        {variantLabel(variant)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div>
                    <p className="mb-2 text-sm font-medium">Quantity</p>
                    <div className="flex w-fit items-center rounded-full border">
                        <button
                            type="button"
                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                            className="flex size-10 items-center justify-center text-lg text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                        <button
                            type="button"
                            disabled={quantity >= stock}
                            onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
                            className="flex size-10 items-center justify-center text-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {isSoldOut ? "Out of stock" : `${stock} in stock`}
                    </p>
                </div>

                {/*
                 * Saving is per product, not per variant — core-api's wishlist keys on the
                 * product — so the heart is unaffected by the size chosen above, and stays
                 * available on a sold-out product, which is much of the point of saving one.
                 */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Button
                        variant="accent"
                        size="lg"
                        className="h-12 w-full text-sm sm:w-auto sm:px-10"
                        disabled={isSoldOut || !selectedVariant}
                        onClick={() => selectedVariant && addItem(toCartLine(product, selectedVariant), quantity)}
                    >
                        {isSoldOut ? "Sold out" : "Add to cart"}
                    </Button>
                    {/* Its own column so a failure reads under the heart, not beside the cart button. */}
                    <div className="flex w-full flex-col gap-1 sm:w-auto">
                        <WishlistButton
                            productId={product.id}
                            productName={product.name}
                            variant="inline"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
