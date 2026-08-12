export interface Category {
    id: number;
    name: string;
    slug: string;
    /** null for a top-level category. */
    parentId: number | null;
    sortOrder: number;
}

/** A category plus the path that makes it unambiguous in a flat <Select>, e.g. "Men › Shirt". */
export interface CategoryOption {
    id: number;
    label: string;
}
