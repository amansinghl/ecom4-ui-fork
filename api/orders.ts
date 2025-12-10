import { apiClient } from "@/lib/api-client";
import { QuickShipQuoteRequest, QuickShipQuoteResponse } from "@/types/quick-ship";

export const getQuote = (data: QuickShipQuoteRequest) =>
  apiClient<QuickShipQuoteResponse>("orders/quote", {
    method: "POST",
    body: data,
  });

