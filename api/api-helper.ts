import { getQueryString } from "@/lib/client_utils";

const base_url =
  process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL;

const ui_version = process.env.NEXT_PUBLIC_UI_VERSION ?? "v2";

export const getRequest = async ({
  endpoint,
  token,
  params = {},
}: {
  endpoint: string;
  token: string;
  params?: { [key: string]: string } | [];
}) => {
  if (token) {
    const queryString = getQueryString(params);
    const url =
      base_url +
      endpoint +
      (queryString.trim() === "" ? "" : "?" + queryString.trim());
    return await (
      await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
    ).json();
  }
  return false;
};
