import Link from "next/link";
import { Baby, Shirt, Venus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { IconBadge } from "@/components/home/icon-badge";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";

function CategoryIcon({ slug }: { readonly slug: string }) {
  if (slug === "women") return <IconBadge icon={Venus} size="lg" />;
  if (slug === "children") return <IconBadge icon={Baby} size="lg" />;
  return <IconBadge icon={Shirt} size="lg" />;
}

export function CategorySection() {
  const categories = getTopLevelCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Shop by category
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/product/${category.slug}`}>
            <Card className="flex flex-col items-center gap-3 bg-card/70 p-8 text-center transition-transform duration-300 hover:-translate-y-1">
              <CategoryIcon slug={category.slug} />
              <span className="font-medium">{category.name}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
