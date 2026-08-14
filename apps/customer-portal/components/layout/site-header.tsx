"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, User, LogOut, Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthSession } from "@/src/features/auth/hooks/use-current-customer";
import { useLogout } from "@/src/features/auth/hooks/use-logout";
import { CartSheet } from "@/src/features/cart/components/cart-sheet";
import { getChildCategories, getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";
import { useCategories } from "@/src/features/categories/hooks/use-categories";
import type { Category } from "@/src/features/categories/types/category";

export function SiteHeader() {
    // Was a module-level constant off mock data. It has to be read per render now that the
    // tree comes from core-api; the query is cached and shared, so the menus, the footer and
    // the grids all resolve to one request.
    const categories = useCategories();
    const navCategories = getTopLevelCategories(categories);

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
                        <form action="/search" className="relative px-4 pb-2">
                            <Search className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="Search products…"
                                className="pl-9"
                                aria-label="Search products"
                            />
                        </form>
                        <nav className="flex flex-col gap-1 px-4">
                            {navCategories.map((category) => (
                                <MobileCategoryGroup key={category.id} category={category} />
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>

                <BrandLogo className="mr-2" size="sm" />

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                                render={<Link href="/#">Home</Link>}
                            />
                        </NavigationMenuItem>
                        {navCategories.map((category) => (
                            <CategoryNavItem key={category.id} category={category} />
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <form action="/search" className="relative ml-auto hidden max-w-xs flex-1 sm:block">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        name="q"
                        placeholder="Search products…"
                        className="pl-9"
                        aria-label="Search products"
                    />
                </form>

                <div className="ml-auto flex items-center gap-1 sm:ml-2">
                    <HeaderAuthActions />
                </div>
            </div>
        </header>
    );
}

function HeaderAuthActions() {
    const router = useRouter();
    const { isAuthenticated, isResolving } = useAuthSession();
    const logout = useLogout();

    // Leave the page before the session is dropped: `useLogout` clears the /me cache,
    // which would otherwise let `RequireCustomer` bounce an account page to /login
    // and win the race against this redirect.
    const handleLogout = () => {
        if (logout.isPending) return;
        router.push("/");
        logout.mutate();
    };

    // While /me is in flight we don't know yet — hold the space with placeholders so the
    // header doesn't flash "Log in" at someone signed in, or jump once the answer lands.
    if (isResolving) {
        return (
            <>
                <Skeleton className="size-8 rounded-lg" />
                <CartSheet />
                <Skeleton className="hidden h-9 w-20 rounded-lg sm:block" />
            </>
        );
    }

    return (
        <>
            {isAuthenticated && (
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Account"
                    nativeButton={false}
                    render={<Link href="/account" />}
                >
                    <User className="size-5" />
                </Button>
            )}

            <CartSheet />

            {isAuthenticated ? (
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={logout.isPending ? "Logging out" : "Log out"}
                    aria-busy={logout.isPending}
                    disabled={logout.isPending}
                    onClick={handleLogout}
                >
                    {logout.isPending ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <LogOut className="size-5" />
                    )}
                </Button>
            ) : (
                <Button
                    variant="accent"
                    size="sm"
                    className="hidden h-9 px-4 text-sm sm:inline-flex"
                    nativeButton={false}
                    render={<Link href="/login" />}
                >
                    Log in
                </Button>
            )}
        </>
    );
}

function CategoryNavItem({ category }: { readonly category: Category }) {
    const children = getChildCategories(useCategories(), category.id);

    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground">
                {category.name}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-48 gap-0.5">
                    <li>
                        <NavigationMenuLink render={<Link href={`/product/${category.slug}`} />}>
                            All {category.name}
                        </NavigationMenuLink>
                    </li>
                    {children.map((child) => (
                        <li key={child.id}>
                            <NavigationMenuLink
                                render={<Link href={`/product/${category.slug}?category=${child.slug}`} />}
                            >
                                {child.name}
                            </NavigationMenuLink>
                        </li>
                    ))}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}

function MobileCategoryGroup({ category }: { readonly category: Category }) {
    const children = getChildCategories(useCategories(), category.id);

    return (
        <div className="py-1">
            <Link
                href={`/product/${category.slug}`}
                className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
            >
                {category.name}
            </Link>
            <div className="flex flex-col gap-0.5 pl-4">
                {children.map((child) => (
                    <Link
                        key={child.id}
                        href={`/product/${category.slug}?category=${child.slug}`}
                        className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        {child.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
