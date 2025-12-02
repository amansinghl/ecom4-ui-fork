import { PaginationType, Link, LinksType } from "@/types/shipments";

export type CodTransactionType = {
  shipment_no: number;
  awb_no: string;
  shipment_date: string;
  cod_amount: string;
  paid_amount: string;
  supplier_id: number;
  status: number;
  delivered_date: string;
  payment_mode: string;
  payment_ref_no: string;
  payment_date: string;
  reference1: string | null;
  tracking_status: string | null;
  cod_aging: number;
  pending_since: string | null;
  cod_status: string;
};

export type CodTransactionsType = CodTransactionType[];

export type { PaginationType, Link, LinksType };

export type CodTransactionsResponseType = {
  data: CodTransactionsType | [];
  path: string;
  links: LinksType;
} & PaginationType;

export type CodTransactionsApiData = {
  cod_adjustable: number;
  cod_transactions: CodTransactionsResponseType;
};

