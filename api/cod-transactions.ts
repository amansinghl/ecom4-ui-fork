import { apiClient } from "@/lib/api-client";
import { CodTransactionsApiData } from "@/types/cod-transactions";

type CodTransactionsApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: CodTransactionsApiData;
};

export const getCodTransactions = (params?: Record<string, string>) =>
  apiClient<CodTransactionsApiResponse>("transactions/cod-transactions", { params });

