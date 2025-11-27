import { apiClient } from "@/lib/api-client";
import { ShipmentsResponseType } from "@/types/shipments";

type ShipmentsApiResponse = {
  meta: { status_code: number };
  data: { shipments: ShipmentsResponseType };
};

export const getShipments = (params?: Record<string, string>) =>
  apiClient<ShipmentsApiResponse>("shipments", { params });
