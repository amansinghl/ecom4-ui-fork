import { apiClient, getAuthToken } from "@/lib/api-client";
import {
  TransactionsApiData,
  LedgerApiData,
  CreditApiData,
  PromoCodesApiData,
} from "@/types/transactions";

const BASE_URL = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL;

// Get credit details (wallet balance)
export const getCreditDetails = () =>
  apiClient<CreditApiData>("transactions/credit");

// Refresh wallet
export const refreshWallet = () =>
  apiClient<CreditApiData>("transactions/refresh-wallet");

// Get promo codes
export const getPromoCodes = () =>
  apiClient<PromoCodesApiData>("entities/promo-codes");

// Redeem promo code
export const redeemPromoCode = async (data: {
  promo_code: string;
  promo_amount: string;
}): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("entities/redeem-promo-codes", BASE_URL);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData?.data?.message) {
      throw new Error(errorData.data.message);
    }
    throw new Error(`Failed to redeem promo code: ${response.status}`);
  }
};

// Add money to wallet
export const addMoneyToWallet = async (data: {
  name: string;
  email: string;
  mobile: string;
  amount: string;
  remark?: string;
  product?: string;
  booking_reference_number?: string | null;
  gateway_name?: string;
}): Promise<{ url: string }> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("online-payments/add-money-to-wallet", BASE_URL);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData?.data?.message) {
      throw new Error(errorData.data.message);
    }
    throw new Error(`Failed to add money: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

// Get payments/transactions list
export const getPayments = (params?: Record<string, string>) =>
  apiClient<TransactionsApiData>("transactions/payments", { params });

// Download transactions CSV
export const downloadTransactions = async (
  params?: Record<string, string>,
): Promise<Blob> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/payments", BASE_URL);
  url.searchParams.set("download", "true");
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status}`);
  }

  return await response.blob();
};

// Download voucher PDF
export const downloadVoucherPdf = async (
  voucherNo: string,
): Promise<string> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/download-voucher", BASE_URL);
  url.searchParams.set("voucher_no", voucherNo);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download voucher: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

// Get ledger transactions
export const getLedger = (params?: Record<string, string>) =>
  apiClient<LedgerApiData>("transactions/ledger", { params });

// Download ledger CSV
export const downloadLedger = async (
  params?: Record<string, string>,
): Promise<string> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/ledger/download", BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorData = await response.json();
      if (errorData?.data?.message) {
        throw new Error(errorData.data.message);
      }
    }
    throw new Error(`Failed to download ledger: ${response.status}`);
  }

  return await response.text();
};

// Download ledger voucher PDF (note: typo in endpoint name)
export const downloadLedgerVoucherPdf = async (
  voucherNo: string,
): Promise<string> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/download-voucger", BASE_URL);
  url.searchParams.set("voucher_no", voucherNo);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download voucher: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

