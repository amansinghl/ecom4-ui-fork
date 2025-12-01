import { apiClient } from "@/lib/api-client";
import { WeightDisputesResponseType } from "@/types/weights";

type WeightDisputesApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: { disputable: WeightDisputesResponseType };
};

export const getWeightDisputes = (params?: Record<string, string>) =>
  apiClient<WeightDisputesApiResponse>("disputable/list", { params });

