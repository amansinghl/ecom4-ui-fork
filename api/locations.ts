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

export const createLocation = (data: Record<string, any>) =>
  apiClient<UpdateLocationApiResponse>("locations", {
    method: "POST",
    body: data,
  });

export const deleteLocation = (locationData: Record<string, any>) =>
  apiClient<UpdateLocationApiResponse>("locations", {
    method: "POST",
    body: { ...locationData, visibility: 0 },
  });

type PincodeDetailResponse = {
  pincode: string;
  city: string;
  state: string;
  country: string;
};

export const getPincodeDetail = (pincode: string) =>
  apiClient<PincodeDetailResponse>("get-pincode-detail", {
    method: "POST",
    body: { pincode },
  });

type CountryType = {
  id: number;
  name: string;
  isd_code: string;
  two_digit_code: string;
  three_digit_code: string;
  created_at: string;
  updated_at: string;
};

type CountriesApiResponse = CountryType[];

export const getCountriesList = () =>
  apiClient<CountriesApiResponse>("get-countries-list");

