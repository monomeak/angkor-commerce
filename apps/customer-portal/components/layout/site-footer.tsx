import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Separator } from "@/components/ui/separator";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";

const navCategories = getTopLevelCategories();

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <BrandLogo size="sm" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Khmer clothing storefront — traditional krama and sampot alongside
            everyday essentials for men, women, and children.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {navCategories.map((category) => (
              <li key={category.id}>
                <Link href={`/product/${category.slug}`} className="hover:text-foreground">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-foreground">
                Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-foreground">
                Sign up
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <Separator />

      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Angkor Commerce. All rights reserved.
      </div>
    </footer>
  );
}
