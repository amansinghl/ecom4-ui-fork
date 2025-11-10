import { getRequest } from "@/api/api-helper";

export const getShipments = async (
  token: string,
  params: { [key: string]: string } | [],
) => await getRequest({ token, endpoint: "shipments", params });
