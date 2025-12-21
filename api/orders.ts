import { apiClient } from "@/lib/api-client";
import { QuickShipQuoteRequest, QuoteResponseData } from "@/types/quick-ship";

export const getQuote = (data: QuickShipQuoteRequest) =>
  apiClient<QuoteResponseData>("orders/quote", {
    method: "POST",
    body: data,
  });

