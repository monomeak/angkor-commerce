"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, User } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";

const navCategories = getTopLevelCategories();

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
                <Sheet>
                    <SheetTrigger
                        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}
                    >
                        <Menu className="size-5" />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72">
                        <SheetHeader>
                            <SheetTitle>
                                <BrandLogo size="sm" />
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 px-4">
                            {navCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/product/${category.slug}`}
                                    className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>

                <BrandLogo className="mr-2" size="sm" />

                <nav className="hidden items-center gap-1 md:flex">
                    {navCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/product/${category.slug}`}
                            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                        >
                            {category.name}
                        </Link>
                    ))}
                </nav>

                <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="search" placeholder="Search products…" className="pl-9" aria-label="Search products" />
                </div>

                <div className="ml-auto flex items-center gap-1 sm:ml-2">
                    <Button variant="ghost" size="icon" aria-label="Account">
                        <User className="size-5" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Cart">
                        <ShoppingCart className="size-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
