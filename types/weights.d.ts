import { PaginationType, Link, LinksType } from "@/types/shipments";

export type WeightDisputeType = {
  shipment_no: number;
  supplier_id: number;
  reference1: string | null;
  reference2: string | null;
  invoice_date: string | null;
  invoice_weight: number;
  weight_charge: string;
  dispute_id: number | null;
  settled_weight: number | null;
  dispute_raised_date: string | null;
  dispute_status: string | null;
  shipment_date: string;
  booked_weight: string;
  accounts_entity_id: number;
  awb_no: string;
  tracking_status: number;
  product: string;
  product_value: string;
  id: number | null;
  dispute_proofs: string | null;
  partner_proofs: string | null;
  settled_date: string | null;
  shipper_remark: string | null;
  supplier_remark: string | null;
  disputed_at: string;
  booking_date: string;
  dispute_weight: number | null;
  rto_delivered_date: string | null;
  sorter_links: string | null;
  picked_up: boolean;
};

export type WeightDisputesType = WeightDisputeType[];

export type { PaginationType, Link, LinksType };

export type WeightDisputesResponseType = {
  data: WeightDisputesType | [];
  path: string;
  links: LinksType;
} & PaginationType;

