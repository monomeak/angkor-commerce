import { Footprints, Gem, HatGlasses, Shirt } from "lucide-react";

type ProductIconProps = {
  readonly categoryName: string;
  readonly className?: string;
};

// No product photography exists yet (see docs/NEXTJS_MIGRATION_PLAN.md
// "Assets Migration" — several mock image paths have no real asset behind
// them). This gives every product a category-appropriate placeholder icon
// instead of a broken <img>.
export function ProductIcon({ categoryName, className }: ProductIconProps) {
  const name = categoryName.toLowerCase();

  if (name.includes("shoe")) {
    return <Footprints className={className} strokeWidth={1.25} />;
  }
  if (name.includes("hat")) {
    return <HatGlasses className={className} strokeWidth={1.25} />;
  }
  if (name.includes("accessories")) {
    return <Gem className={className} strokeWidth={1.25} />;
  }

  return <Shirt className={className} strokeWidth={1.25} />;
}
