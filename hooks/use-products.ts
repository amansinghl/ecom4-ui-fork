"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    placeholderData: (previousData) => previousData,
  });
}

