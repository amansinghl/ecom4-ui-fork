import { PaginationType } from "@/types/shipments";

export type CreditDetails = {
  credit_balance: string;
  credit_limit: string;
};

export type PaymentTransaction = {
  transaction_date: string;
  booking_email: string;
  voucher_no: string;
  transaction_amount: string;
  credit_amount: string;
  debit_amount: string;
  transaction_unique_id: string;
  payment_mode: string;
  payment_status: string;
  remark: string;
};

export type LedgerTransaction = {
  transaction_date: string;
  shipment_no: string;
  voucher_no: string;
  remark: string;
  accounting_type: string;
  amount: string;
  credit: string;
  debit: string;
};

export type TransactionsResponse = {
  data: PaymentTransaction[];
  total: number;
} & PaginationType;

export type LedgerResponse = {
  data: LedgerTransaction[];
  total: number;
} & PaginationType;

export type TransactionsApiData = {
  transactions: TransactionsResponse;
};

export type LedgerApiData = {
  ledgerTransactions: LedgerResponse;
};

export type CreditApiData = {
  creditDetails: CreditDetails;
};

export type PromoCode = {
  promo_code: string;
  promo_amount: string;
};

export type PromoCodesApiData = {
  promo_codes: PromoCode[];
};

