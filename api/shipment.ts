import { apiClient } from "@/lib/api-client";
import {
  ShipmentDetailsAPIResponseType,
  ShipmentTrackingAPIResponseType,
  ShipmentNotificationsAPIResponseType,
  ShipmentCostBreakupAPIResponseType,
  ShipmentTransactionsAPIResponseType,
  ShipmentWeightHistoryAPIResponseType,
  ShipmentPODAPIResponseType,
  ShipmentQCImagesAPIResponseType,
  ShipmentAddressesAPIResponseType,
  ShipmentPackageDetailsAPIResponseType,
  ShipmentNDRAPIResponseType,
  ShipmentSorterImagesAPIResponseType,
  ShipmentPickupIDAPIResponseType,
  ShipmentCommunicationsAPIResponseType,
  ShipmentDisputesAPIResponseType,
} from "@/types/shipment";

export const getShipmentDetails = (shipmentNo: string) =>
  apiClient<ShipmentDetailsAPIResponseType>(`shipments/${shipmentNo}`);

export const getShipmentTrackingDetails = (shipmentNo: string) =>
  apiClient<ShipmentTrackingAPIResponseType>(`shipments/${shipmentNo}/track`);

export const getShipmentNotifications = (shipmentNo: string) =>
  apiClient<ShipmentNotificationsAPIResponseType>(
    `shipments/${shipmentNo}/notifications`,
  );

export const getShipmentCostBreakup = (shipmentNo: string) =>
  apiClient<ShipmentCostBreakupAPIResponseType>(
    `shipments/${shipmentNo}/cost-breakup`,
  );

export const getShipmentTransactions = (shipmentNo: string) =>
  apiClient<ShipmentTransactionsAPIResponseType>(
    `shipments/${shipmentNo}/transaction`,
  );

export const getShipmentWeightHistory = (shipmentNo: string) =>
  apiClient<ShipmentWeightHistoryAPIResponseType>(
    `shipments/${shipmentNo}/weight-history`,
  );

export const getShipmentPOD = (shipmentNo: string) =>
  apiClient<ShipmentPODAPIResponseType>(`shipments/${shipmentNo}/getpod`);

export const getShipmentQCImages = (shipmentNo: string) =>
  apiClient<ShipmentQCImagesAPIResponseType>(
    `shipments/${shipmentNo}/qc-images`,
  );

export const getShipmentAddresses = (shipmentNo: string) =>
  apiClient<ShipmentAddressesAPIResponseType>(
    `shipments/${shipmentNo}/addresses`,
  );

export const getShipmentPackages = (shipmentNo: string) =>
  apiClient<ShipmentPackageDetailsAPIResponseType>(
    `shipments/${shipmentNo}/package-details`,
  );

export const getShipmentNDR = (shipmentNo: string) =>
  apiClient<ShipmentNDRAPIResponseType>(`ndr?shipment_numbers=${shipmentNo}`);

export const getShipmentSorterImages = (shipmentNo: string) =>
  apiClient<ShipmentSorterImagesAPIResponseType>(
    `shipments/${shipmentNo}/getSorterImages`,
  );

export const getShipmentPickupID = (shipmentNo: string) =>
  apiClient<ShipmentPickupIDAPIResponseType>(
    `shipments/${shipmentNo}/pickup_id`,
  );

export const getShipmentCommunications = (shipmentNo: string) =>
  apiClient<ShipmentCommunicationsAPIResponseType>(
    `communications/whatsapp/${shipmentNo}`,
  );

export const getShipmentDisputes = (shipmentNo: string) =>
  apiClient<ShipmentDisputesAPIResponseType>(`dispute/find/${shipmentNo}`);
