import { apiClient } from "@/lib/api-client";

export type DashboardMetricsFilters = {
  from_date?: string;
  to_date?: string;
  supplier_id?: string | number;
  zone?: string;
};

export type WeeklyShipmentMetric = {
  shipment_count: number;
  week_number: number;
  created_year: number;
  week_start_date: string;
};

type WeeklyShipmentMetricsResponse = {
  metrics: WeeklyShipmentMetric[];
};

export type DashboardOverviewResponse = {
  shipment: {
    total_shipments: number;
    unpicked_shipments: number;
    in_transit_shipments: number;
    delivered_shipments: number;
    rtoed_shipments: number;
    trend_percentage: number;
  };
  cod: {
    receivable: number;
    received: number;
    cancelled: number;
    pending: number;
  };
  ndr: {
    total_ndr: number;
    ndr_delivered: number;
    return_ndr: number;
    reattempt_ndr: number;
    fake_ndr: number;
  };
};

export const getWeeklyShipmentMetrics = (params?: DashboardMetricsFilters) =>
  apiClient<WeeklyShipmentMetricsResponse>("metrics/shipments/per-week-remittance", {
    params: params as Record<string, string>,
  });

export const getDashboardOverview = () =>
  apiClient<DashboardOverviewResponse>("metrics/overview");

