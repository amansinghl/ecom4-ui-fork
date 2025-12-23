import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/api/invoices";
import { InvoicesApiData } from "@/types/invoices";

export const useInvoices = (params?: Record<string, string>) => {
  return useQuery<InvoicesApiData>({
    queryKey: ["invoices", params],
    queryFn: () => getInvoices(params),
    enabled: true,
  });
};

