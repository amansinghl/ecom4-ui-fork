import { apiClient } from "@/lib/api-client";

export type PartnerType = {
  partner_id: number;
  name: string;
  logo: string;
  // ... other partner fields
};

type PartnersApiResponse = {
  partners: PartnerType[];
};

export const getPartners = () =>
  apiClient<PartnersApiResponse>("masters/get-partners");

