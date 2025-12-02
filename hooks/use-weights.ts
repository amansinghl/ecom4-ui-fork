"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeightDisputes } from "@/api/weights";

export function useWeights(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["weights", params],
    queryFn: () => getWeightDisputes(params),
    placeholderData: (previousData) => previousData,
  });
}

