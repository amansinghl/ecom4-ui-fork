import { apiClient, getAuthToken } from "@/lib/api-client";
import { InvoicesApiData, AccountSummaryApiData } from "@/types/invoices";

const BASE_URL = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL;

// Get invoices list
export const getInvoices = (params?: Record<string, string>) =>
  apiClient<InvoicesApiData>("invoices", { params });

// Download invoice
export const downloadInvoice = async (invoiceNumber: string): Promise<{ message: string }> => {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL(`invoices/${invoiceNumber}/download`, BASE_URL);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData?.data?.message) {
      throw new Error(errorData.data.message);
    }
    throw new Error(`Failed to download invoice: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

// Get account summary (passbook)
export const getAccountSummary = (params?: Record<string, string>) =>
  apiClient<AccountSummaryApiData>("invoices/account-summary", { params });

