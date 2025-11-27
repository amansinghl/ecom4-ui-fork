"use client";

import { useQuery } from "@tanstack/react-query";
import { getShipments } from "@/api/shipments";

export function useShipments(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["shipments", params],
    queryFn: () => getShipments(params),
  });
}

