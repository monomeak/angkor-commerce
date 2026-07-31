// Mirrors the self-referencing `categories` table in apps/core-api
// (docs/angkor_commerce_schema_sample.sql): top-level rows have
// parentId === null; every subcategory points back to its parent.
export type Category = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
};
