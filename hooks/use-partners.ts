"use client";

import { useQuery } from "@tanstack/react-query";
import { getPartners } from "@/api/masters";

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: () => getPartners(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    placeholderData: (previousData) => previousData,
  });
}

