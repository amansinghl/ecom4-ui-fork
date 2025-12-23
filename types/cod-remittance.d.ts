import { PaginationType } from "@/types/shipments";

export type CodRemittanceBatch = {
  remittance_batch_id: string;
  initiated_at: string;
  payment_date: string;
  cod_amount: string;
};

export type CodRemittanceShipment = {
  shipment_no: string;
  cod_amount: string;
  paid_amount: string;
  payment_ref_no: string;
  payment_date: string;
  delivered_date: string;
  status: number; // 0=Pending, 1=Receivable, 2=Receivable, 3=Received, 4=Cod Cancelled
};

export type CodRemittanceResponse = {
  data: CodRemittanceBatch[];
  total: number;
} & PaginationType;

export type CodRemittanceApiData = {
  cod_transactions: CodRemittanceResponse;
  cod_adjustable: number;
  total: number;
};

export type CodRemittanceDetailsApiData = {
  cod_remittance_details: Record<string, CodRemittanceShipment[]>;
};

