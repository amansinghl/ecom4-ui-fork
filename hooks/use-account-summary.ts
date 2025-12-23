import { useQuery } from "@tanstack/react-query";
import { getAccountSummary } from "@/api/invoices";
import { AccountSummaryApiData } from "@/types/invoices";

export const useAccountSummary = (params?: Record<string, string>) => {
  return useQuery<AccountSummaryApiData>({
    queryKey: ["account-summary", params],
    queryFn: () => getAccountSummary(params),
    enabled: !!params?.month, // Only fetch when month parameter is provided
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2, // Retry failed requests 2 times
  });
};

