"use client";

import { QueryObserverResult, useQueries } from "@tanstack/react-query";
import {
  getShipmentDetails,
  getShipmentTrackingDetails,
  getShipmentNotifications,
  getShipmentCostBreakup,
  getShipmentTransactions,
  getShipmentWeightHistory,
  getShipmentPOD,
  getShipmentQCImages,
  getShipmentAddresses,
  getShipmentPackages,
  getShipmentNDR,
  getShipmentSorterImages,
  getShipmentPickupID,
  getShipmentCommunications,
  getShipmentDisputes,
} from "@/api/shipment";

const API_Response_Indexes = [
  "shipment_details",
  "shipment_tracking_details",
  "shipment_notifications_details",
  "shipment_cost_breakup_details",
  "shipment_transactions_details",
  "shipment_weight_history",
  "shipment_proof_of_delivery",
  "shipment_qc_images",
  "shipment_addresses",
  "shipment_packages",
  "shipment_ndr",
  "shipment_sorter_images",
  "shipment_pickup_id",
  "shipment_communications",
  "shipment_disputes",
];

export function useCompleteShipmentDetails(shipmentNo: string) {
  return useQueries({
    queries: [
      {
        queryKey: ["shipment_details", shipmentNo],
        queryFn: () => getShipmentDetails(shipmentNo),
      },
      {
        queryKey: ["shipment_tracking_details", shipmentNo],
        queryFn: () => getShipmentTrackingDetails(shipmentNo),
      },
      {
        queryKey: ["shipment_notifications_details", shipmentNo],
        queryFn: () => getShipmentNotifications(shipmentNo),
      },
      {
        queryKey: ["shipment_cost_breakup_details", shipmentNo],
        queryFn: () => getShipmentCostBreakup(shipmentNo),
      },
      {
        queryKey: ["shipment_transactions_details", shipmentNo],
        queryFn: () => getShipmentTransactions(shipmentNo),
      },
      {
        queryKey: ["shipment_weight_history", shipmentNo],
        queryFn: () => getShipmentWeightHistory(shipmentNo),
      },
      {
        queryKey: ["shipment_proof_of_delivery", shipmentNo],
        queryFn: () => getShipmentPOD(shipmentNo),
      },
      {
        queryKey: ["shipment_qc_images", shipmentNo],
        queryFn: () => getShipmentQCImages(shipmentNo),
      },
      {
        queryKey: ["shipment_addresses", shipmentNo],
        queryFn: () => getShipmentAddresses(shipmentNo),
      },
      {
        queryKey: ["shipment_packages", shipmentNo],
        queryFn: () => getShipmentPackages(shipmentNo),
      },
      {
        queryKey: ["shipment_ndr", shipmentNo],
        queryFn: () => getShipmentNDR(shipmentNo),
      },
      {
        queryKey: ["shipment_sorter_images", shipmentNo],
        queryFn: () => getShipmentSorterImages(shipmentNo),
      },
      {
        queryKey: ["shipment_pickup_id", shipmentNo],
        queryFn: () => getShipmentPickupID(shipmentNo),
      },
      {
        queryKey: ["shipment_communications", shipmentNo],
        queryFn: () => getShipmentCommunications(shipmentNo),
      },
      {
        queryKey: ["shipment_disputes", shipmentNo],
        queryFn: () => getShipmentDisputes(shipmentNo),
      },
    ],
    combine: (results) => {
      const combinedResult: { [key: string]: QueryObserverResult } = {};
      results.forEach((value, index: number) => {
        const resultIndex: string = API_Response_Indexes[index];
        combinedResult[resultIndex] = value;
      });
      return combinedResult;
    },
  });
}
