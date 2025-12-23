"use client";

import { useQuery } from "@tanstack/react-query";
import { getLedger } from "@/api/transactions";

export function useLedger(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["ledger", params],
    queryFn: () => getLedger(params),
    placeholderData: (previousData) => previousData,
  });
}

