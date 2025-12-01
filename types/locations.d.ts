import { PaginationType, Link, LinksType } from "@/types/shipments";

export type LocationType = {
  id: string;
  location_name: string;
  location_type?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  full_name?: string | null;
  email?: string | null;
  calling_code?: string | null;
  contact?: string | null;
  channel_name?: string | null;
  open_time?: string | null;
  closed_time?: string | null;
  lat?: string | null;
  long?: string | null;
  vendor_pan_no?: string | null;
  vendor_gst_no?: string | null;
  visibility?: string | null;
};

export type LocationsType = LocationType[];

export type { PaginationType, Link, LinksType };

export type LocationsResponseType = {
  data: LocationsType | [];
  path: string;
  links: LinksType;
} & PaginationType;

