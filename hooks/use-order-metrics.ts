"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getOrderConversionMetrics,
  getOrderActivityMetrics,
  getOrderStatsSummary,
} from "@/api/orders";

export function useOrderConversionMetrics() {
  return useQuery({
    queryKey: ["orders", "metrics", "conversion"],
    queryFn: () => getOrderConversionMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useOrderActivityMetrics() {
  return useQuery({
    queryKey: ["orders", "metrics", "activity"],
    queryFn: () => getOrderActivityMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useOrderStatsSummary() {
  return useQuery({
    queryKey: ["orders", "metrics", "summary"],
    queryFn: () => getOrderStatsSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

