"use client";

import { useQuery } from "@tanstack/react-query";
import { getCreditDetails, refreshWallet } from "@/api/transactions";

export function useCredit() {
  return useQuery({
    queryKey: ["credit"],
    queryFn: () => getCreditDetails(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRefreshWallet() {
  return useQuery({
    queryKey: ["refresh-wallet"],
    queryFn: () => refreshWallet(),
    enabled: false, // Only fetch when explicitly called
  });
}

