"use client";

import { useQuery } from "@tanstack/react-query";
import { getCodTransactionsOverall } from "@/api/cod-transactions";

  export function useCodTransactionsOverall(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["cod-transactions-overall", params],
    queryFn: () => getCodTransactionsOverall(params),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

