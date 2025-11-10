export type ShipmentType = {
  shipment_no: number;
  tracking_id: string;
  rto_tracking_id: string | null;
  supplier_id: number;
  supplier_name: string;
  booking_status: number;
  tracking_status: number;
  booking_medium: string;
  bulk_id: string;
  reference1: string;
  product_code: string;
  cancelled_at: string;
  shipment_date: string;
  from_pincode: string;
  to_pincode: string;
  cod_value: string;
  channel_id: string;
  mode_transport: string;
  shipment_type: string;
  service_type: string;
  lr_num: string | null;
  rto_delivered_date: string | null;
  rto_initiated_date: string | null;
  delivered_date: string | null;
  seller_name: string;
  seller_contact: string;
  origin_city: string;
  origin_state: string;
  consignee_name: string;
  consignee_contact: string;
  destination_city: string;
  destination_state: string;
  destination_pincode: string;
  partner_name: string;
  partner_logo: string;
  channel_name: string;
  acknowledge: number;
  status: string;
  child_awb_number: string | null;
  user_reason: string;
  tracking_category: string;
  tracking_status_message: string;
  partner_last_update: string;
  estimated_delivery_date: string;
  debit_credit_difference: string;
  product: string;
  product_value: string;
  total_price: string;
  weight: string;
  volumetric_weight: string;
  cn_status: string;
  picked_up: false;
};

export type ShipmentsType = ShipmentType[];

export type Link = {
  url: string | null;
  label: string;
  active: boolean;
};

export type LinksType = Link[];

export type PaginationType = {
  first_page_url: string | null;
  prev_page_url: string | null;
  next_page_url: string | null;
  last_page_url: string | null;

  current_page: number;
  from: number;
  to: number;
  last_page: number;

  per_page: number;
  total: number;
};

export type ShipmentsResponseType = {
  data: ShipmentsType | [];
  path: string;
  links: LinksType;
} & PaginationType;
