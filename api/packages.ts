import { apiClient } from "@/lib/api-client";
import { PackagesResponseType } from "@/types/packages";

type PackagesApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: { packages: PackagesResponseType };
};

export const getPackages = (params?: Record<string, string>) =>
  apiClient<PackagesApiResponse>("packages", { params });

