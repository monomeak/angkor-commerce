import { CategoryCard } from "@/components/home/category-card";
import { getTopLevelCategories } from "@/src/features/categories/lib/category-helpers";

export function CategorySection() {
  const categories = getTopLevelCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Shop by category
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
