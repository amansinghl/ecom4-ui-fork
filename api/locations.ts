import { apiClient } from "@/lib/api-client";
import { LocationsResponseType, LocationType } from "@/types/locations";

type LocationsApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: { locations: LocationsResponseType };
};

type UpdateLocationApiResponse = {
  meta: { status_code: number; status: string; message: string };
  data: { location: LocationType };
};

export const getLocations = (params?: Record<string, string>) =>
  apiClient<LocationsApiResponse>("locations", { params });

export const updateLocation = (
  locationId: string,
  data: Partial<LocationType>,
) =>
  apiClient<UpdateLocationApiResponse>(`locations/${locationId}`, {
    method: "PUT",
    body: data,
  });

