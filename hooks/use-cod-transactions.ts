"use client";

import { useQuery } from "@tanstack/react-query";
import { getCodTransactions } from "@/api/cod-transactions";

export function useCodTransactions(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["cod-transactions", params],
    queryFn: () => getCodTransactions(params),
    placeholderData: (previousData) => previousData,
  });
}

