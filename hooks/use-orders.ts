"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/api/orders";

export function useOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
    placeholderData: (previousData) => previousData,
  });
}

