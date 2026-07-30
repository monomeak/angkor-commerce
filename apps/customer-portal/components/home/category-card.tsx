import Link from "next/link";
import { Baby, Shirt, Venus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { IconBadge } from "@/components/home/icon-badge";
import type { Category } from "@/src/features/categories/types/category";

function CategoryIcon({ slug }: { readonly slug: string }) {
    const className = "absolute -right-6 -bottom-6 text-primary/70 ring-0";
    if (slug === "women") return <IconBadge icon={Venus} size="xl" className={className} />;
    if (slug === "children") return <IconBadge icon={Baby} size="xl" className={className} />;
    return <IconBadge icon={Shirt} size="xl" className={className} />;
}

type CategoryCardProps = {
    readonly category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/product/${category.slug}`}>
            <Card className="relative isolate min-h-[100px] overflow-hidden bg-card/70 p-6 transition-transform duration-300 hover:-translate-y-1">
                <span className="text-xl font-semibold">{category.name}</span>
                <CategoryIcon slug={category.slug} />
            </Card>
        </Link>
    );
}
