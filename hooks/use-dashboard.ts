"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getWeeklyShipmentMetrics,
  getDashboardOverview,
  type DashboardMetricsFilters,
} from "@/api/dashboard";

export function useWeeklyShipmentMetrics(filters: DashboardMetricsFilters = {}) {
  return useQuery({
    queryKey: ["dashboard", "weekly-metrics", filters],
    queryFn: () => getWeeklyShipmentMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => getDashboardOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

