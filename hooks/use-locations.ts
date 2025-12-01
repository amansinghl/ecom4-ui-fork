"use client";

import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/api/locations";

export function useLocations(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["locations", params],
    queryFn: () => getLocations(params),
    placeholderData: (previousData) => previousData,
  });
}

