"use client";

import { useQuery } from "@tanstack/react-query";
import { getLocations, getPincodeDetail } from "@/api/locations";

export function useLocations(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["locations", params],
    queryFn: () => getLocations(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePincodeDetail(pincode: string | undefined) {
  return useQuery({
    queryKey: ["pincode-detail", pincode],
    queryFn: () => getPincodeDetail(pincode!),
    enabled: !!pincode && pincode.length === 6,
    placeholderData: (previousData) => previousData,
  });
}

