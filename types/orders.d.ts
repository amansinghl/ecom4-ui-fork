import { PaginationType, Link, LinksType } from "@/types/shipments";

export type OrderType = {
  id: number;
  reference1: string;
  reference2: string | null;
  order_date: string;
  status: string;
  payment_type: string;
  channel_name: string;
  whatsapp_status: string | null;
  recommendation: string | null;
  weight_in_kgs: string | number;
  dimensions: string;
  dest_full_name: string;
  dest_contact: string;
  dest_email: string;
  city: string;
  dest_state: string;
  dest_country: string;
  dest_pincode: string;
  cod_value: string | number;
  product: string;
  product_value: string | number;
  tags: string | null;
  serviceability: string | boolean;
  consignee_location_id: number | null;
  billing_location_id: number | null;
  item_id?: number | null;
};

export type OrdersType = OrderType[];

export type DefaultPackageType = {
  id: number;
  length: string;
  breadth: string;
  height: string;
  unit: string;
};

export type OrdersResponseType = {
  data: OrdersType | [];
  path: string;
  links: LinksType;
} & PaginationType;

export type OrdersApiResponseType = {
  orders: OrdersResponseType;
  defaultPackage: DefaultPackageType | null;
};

