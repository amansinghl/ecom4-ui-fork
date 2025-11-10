import { getRequest } from "@/api/api-helper";

export async function getUserDetails(token: string) {
  return await getRequest({ token, endpoint: "user" });
}

export async function getCredits(token: string) {
  return await getRequest({ token, endpoint: "transactions/credit" });
}
