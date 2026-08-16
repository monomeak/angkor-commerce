import Link from "next/link";
import { PackageOpen, SearchX, SlidersHorizontal, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

/*
 * An empty grid used to be a single grey sentence, which read the same whether the shop had
 * nothing to sell or the shopper had simply dragged the price slider past everything. These
 * separate the two, because only one of them is the shopper's to fix.
 *
 * Each spans the whole grid so the layout does not leave a lone cell in the first column.
 */

type EmptyGridProps = {
    /** Set when a price filter is narrowing the results, so the copy can offer a way out. */
    readonly resetHref?: string;
};

export function NoProductsInCategory({ resetHref }: EmptyGridProps) {
    if (resetHref) {
        return <FilteredOut resetHref={resetHref} />;
    }

    return (
        <Empty className="col-span-full border py-16">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <PackageOpen />
                </EmptyMedia>
                <EmptyTitle>Nothing here yet</EmptyTitle>
                <EmptyDescription>
                    This category has no products at the moment. Try another part of the shop — new arrivals land
                    regularly.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
                    Back to the shop
                </Button>
            </EmptyContent>
        </Empty>
    );
}

export function NoSearchResults({ query, resetHref }: EmptyGridProps & { readonly query: string }) {
    return (
        <Empty className="col-span-full border py-16">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <SearchX />
                </EmptyMedia>
                <EmptyTitle>No matches for “{query}”</EmptyTitle>
                <EmptyDescription>
                    {resetHref
                        ? "Nothing matched that search within the price range you set. Widening the range may help."
                        : "Check the spelling, or try a shorter or more general word — searches match product names, descriptions and item codes."}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                {resetHref ? (
                    <Button variant="outline" nativeButton={false} render={<Link href={resetHref} />}>
                        <SlidersHorizontal />
                        Clear price filter
                    </Button>
                ) : (
                    <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
                        Browse the shop
                    </Button>
                )}
            </EmptyContent>
        </Empty>
    );
}

/** Before anything has been typed — a prompt rather than a failure. */
export function SearchPrompt() {
    return (
        <Empty className="col-span-full border py-16">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Search />
                </EmptyMedia>
                <EmptyTitle>Search the shop</EmptyTitle>
                <EmptyDescription>
                    Type what you are looking for — a product name, a description or an item code all work.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

function FilteredOut({ resetHref }: { readonly resetHref: string }) {
    return (
        <Empty className="col-span-full border py-16">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <SlidersHorizontal />
                </EmptyMedia>
                <EmptyTitle>No products in this price range</EmptyTitle>
                <EmptyDescription>
                    There are products in this category, but none priced within the range you picked.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="outline" nativeButton={false} render={<Link href={resetHref} />}>
                    Clear price filter
                </Button>
            </EmptyContent>
        </Empty>
    );
}
