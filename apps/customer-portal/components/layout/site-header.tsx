"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, User } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getChildCategories,
  getTopLevelCategories,
} from "@/src/features/categories/lib/category-helpers";
import type { Category } from "@/src/features/categories/types/category";

const navCategories = getTopLevelCategories();

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
            }
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
                <MobileCategoryGroup key={category.id} category={category} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <BrandLogo className="mr-2" size="sm" />

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navCategories.map((category) => (
              <CategoryNavItem key={category.id} category={category} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products…"
            className="pl-9"
            aria-label="Search products"
          />
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

function CategoryNavItem({ category }: { readonly category: Category }) {
  const children = getChildCategories(category.id);

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
  const children = getChildCategories(category.id);

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
