import { apiClient } from "@/lib/api-client";
import { LocationsResponseType } from "@/types/locations";

type LocationsApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: { locations: LocationsResponseType };
};

export const getLocations = (params?: Record<string, string>) =>
  apiClient<LocationsApiResponse>("locations", { params });

