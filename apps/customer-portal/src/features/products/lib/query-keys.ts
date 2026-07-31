export const productKeys = {
  all: ["products"] as const,
  list: (filters?: { categorySlug?: string }) =>
    [...productKeys.all, "list", filters ?? {}] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
};
