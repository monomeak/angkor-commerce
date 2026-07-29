import { useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchProducts } from "../api/product-api";
import { productKeys } from "../lib/query-keys";

export function useProductsQuery(filters?: { categorySlug?: string }) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
  });
}

export function useProductQuery(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
  });
}
