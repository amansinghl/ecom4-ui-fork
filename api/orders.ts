import { apiClient } from "@/lib/api-client";
import { QuickShipQuoteRequest, QuoteResponseData } from "@/types/quick-ship";
import { OrdersApiResponseType, OrderType } from "@/types/orders";

export const getQuote = (data: QuickShipQuoteRequest) =>
  apiClient<QuoteResponseData>("orders/quote", {
    method: "POST",
    body: data,
  });

export const getOrders = (params?: Record<string, string>) =>
  apiClient<OrdersApiResponseType>("orders", { params });

export type BulkServiceabilityRequest = {
  origin: string;
  destinations: {
    cod: string[];
    prepaid: string[];
  };
  shipment_type: "express" | "b2c" | "b2b";
};

export type BulkServiceabilityResponse = {
  cod: string[];
  prepaid: string[];
};

export const checkBulkServiceability = (data: BulkServiceabilityRequest) =>
  apiClient<BulkServiceabilityResponse>("check-serviceable-bulk", {
    method: "POST",
    body: data,
  });

export const getManageOrdersQuote = (data: QuickShipQuoteRequest) =>
  apiClient<QuoteResponseData>("orders/manage/create", {
    method: "POST",
    body: data,
  });

export type LineItem = {
  id: number;
  weight_in_kgs?: string | number;
  [key: string]: any;
};

export type LineItemsResponse = {
  line_items: Record<string, LineItem[]>;
};

export type OrderRisksResponse = Record<string, any>;

export type OrderAddressesResponse = {
  addresses: Record<string, any>;
};

export const getOrderLineItems = (orderIds: number[]) =>
  apiClient<LineItemsResponse>("orders/line-items", {
    method: "POST",
    body: orderIds,
  });

export const getOrderRisks = (orderIds: number[]) =>
  apiClient<OrderRisksResponse>("orders/risks", {
    method: "POST",
    body: orderIds,
  });

export const getOrderAddresses = (orderIds: number[]) =>
  apiClient<OrderAddressesResponse>("orders/address", {
    method: "POST",
    body: orderIds,
  });

export const getOrderAddressesById = (orderId: number) =>
  apiClient<any>(`orders/${orderId}/addresses`);

export const updateOrder = (
  orderId: number,
  data: {
    dest_full_name: string;
    dest_email?: string;
    dest_contact: string;
    product_value: number;
    cod_value: number;
    weight_in_kgs: number;
    length: number;
    breadth: number;
    height: number;
    dimensions_unit: "inch" | "cm";
  }
) =>
  apiClient<OrderType>(`orders/${orderId}`, {
    method: "PATCH",
    body: data,
  });

export type MonthlyConversionMetric = {
  month: string;
  new_orders: number;
  converted: number;
};

export type DailyActivityMetric = {
  day: string;
  orders: number;
};

export type OrderStatsSummary = {
  total_orders: number;
  converted_orders: number;
};

type OrderConversionMetricsResponse = {
  metrics: MonthlyConversionMetric[];
};

type OrderActivityMetricsResponse = {
  metrics: DailyActivityMetric[];
};

export const getOrderConversionMetrics = () =>
  apiClient<OrderConversionMetricsResponse>("orders/metrics/conversion");

export const getOrderActivityMetrics = () =>
  apiClient<OrderActivityMetricsResponse>("orders/metrics/activity");

export const getOrderStatsSummary = () =>
  apiClient<OrderStatsSummary>("orders/metrics/summary");

