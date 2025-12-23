import { apiClient, getAuthToken } from "@/lib/api-client";
import { CodTransactionsApiData, CodTransactionsOverallApiData } from "@/types/cod-transactions";
import { CodRemittanceApiData, CodRemittanceDetailsApiData } from "@/types/cod-remittance";

const BASE_URL = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL;

export const getCodTransactions = (params?: Record<string, string>) =>
  apiClient<CodTransactionsApiData>("transactions/cod-transactions", { params });

export const getCodTransactionsOverall = (params?: Record<string, string>) =>
  apiClient<CodTransactionsOverallApiData>("transactions/cod-transactions-overall", { params });

// Download COD reports as CSV
export const downloadCodReports = async (params?: Record<string, string>): Promise<string> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/cod-reports", BASE_URL);
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

  // Check content type first
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    // Try to parse error message
    if (isJson) {
      try {
        const errorData = await response.json();
        if (errorData?.data?.message) {
          throw new Error(errorData.data.message);
        }
      } catch {
        // If parsing fails, throw generic error
      }
    }
    throw new Error(`Failed to download CSV: ${response.status}`);
  }

  // If response is JSON, it might be an error message
  if (isJson) {
    const jsonData = await response.json();
    if (jsonData?.data?.message) {
      throw new Error(jsonData.data.message);
    }
    // If it's JSON but no error message, return as text anyway
    return JSON.stringify(jsonData);
  }

  // Return CSV content as text
  return await response.text();
};

// Link COD amounts to wallet
export const linkCodToWallet = async (shipmentNos: number[]): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/cod-transactions/cod-link-to-wallet", BASE_URL);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ params: shipmentNos }),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      if (errorData?.data?.message) {
        throw new Error(errorData.data.message);
      }
    } catch {
      // If not JSON, throw generic error
    }
    throw new Error(`Failed to link COD to wallet: ${response.status}`);
  }

  const result = await response.json();
  if (result?.data?.message) {
    throw new Error(result.data.message);
  }
};

// COD Remittance APIs
export const getCodRemittance = (params?: Record<string, string>) =>
  apiClient<CodRemittanceApiData>("transactions/cod-remittance", { params });

export const getCodRemittanceDetails = (remittanceBatchIds: string[]) => {
  if (remittanceBatchIds.length === 0) {
    return Promise.resolve({ cod_remittance_details: {} } as CodRemittanceDetailsApiData);
  }
  
  const params = new URLSearchParams();
  remittanceBatchIds.forEach((id) => {
    params.append("remittance_batch_ids[]", id);
  });
  return apiClient<CodRemittanceDetailsApiData>(
    `transactions/cod-remittance-details?${params.toString()}`,
  );
};

// Download single batch CSV
export const downloadCodRemittanceReport = async (
  remittanceBatchId: string,
  params?: Record<string, string>,
): Promise<string> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/cod-remittance-reports", BASE_URL);
  url.searchParams.set("remittance_batch_id", remittanceBatchId);
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
    throw new Error(`Failed to download CSV: ${response.statusText || response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const jsonData = await response.json();
    if (jsonData?.data?.message) {
      throw new Error(jsonData.data.message);
    }
  }

  return await response.text();
};

// Download consolidated CSV
export const downloadCodRemittanceConsolidated = async (
  params?: Record<string, string>,
): Promise<Blob> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("transactions/cod-remittance-consolidated", BASE_URL);
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
    throw new Error(`Failed to download CSV: ${response.statusText || response.status}`);
  }

  return await response.blob();
};

