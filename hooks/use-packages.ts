"use client";

import { useQuery } from "@tanstack/react-query";
import { getPackages } from "@/api/packages";

export function usePackages(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["packages", params],
    queryFn: () => getPackages(params),
    placeholderData: (previousData) => previousData,
  });
}

