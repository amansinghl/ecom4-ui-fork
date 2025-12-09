import { apiClient } from "@/lib/api-client";
import { LocationsResponseType, LocationType } from "@/types/locations";

type LocationsApiResponse = {
  locations: LocationsResponseType;
};

type UpdateLocationApiResponse = {
  location: LocationType;
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

export const deleteLocation = (locationData: Record<string, any>) =>
  apiClient<UpdateLocationApiResponse>("locations", {
    method: "POST",
    body: { ...locationData, visibility: 0 },
  });

