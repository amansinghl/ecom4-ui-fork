"use client";

import { useQuery } from "@tanstack/react-query";
import { getPayments } from "@/api/transactions";

export function usePayments(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => getPayments(params),
    placeholderData: (previousData) => previousData,
  });
}

