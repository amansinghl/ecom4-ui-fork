import { apiClient } from "@/lib/api-client";
import { ShipmentsResponseType } from "@/types/shipments";

type ShipmentsApiResponse = {
  meta: { status_code: number };
  data: { shipments: ShipmentsResponseType };
};

export const getShipments = (params?: Record<string, string>) =>
  apiClient<ShipmentsApiResponse>("shipments", { params });



// examples to use the apiClient with different methods

// export const createShipment = (data: CreateShipmentInput) =>
//   apiClient<ShipmentResponse>("shipments", { method: "POST", body: data });

// export const updateShipment = (id: string, data: UpdateShipmentInput) =>
//   apiClient<ShipmentResponse>(`shipments/${id}`, { method: "PUT", body: data });

// export const deleteShipment = (id: string) =>
//   apiClient<void>(`shipments/${id}`, { method: "DELETE" });