"use client";

import { useQuery } from "@tanstack/react-query";
import { getCodRemittance } from "@/api/cod-transactions";

export function useCodRemittance(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["cod-remittance", params],
    queryFn: () => getCodRemittance(params),
    placeholderData: (previousData) => previousData,
  });
}

