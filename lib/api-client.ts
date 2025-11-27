import { getAuthToken } from "@/lib/auth";
import useUserStore from "@/store/user";

const BASE_URL = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: { params?: Record<string, string> } = {},
): Promise<T> {
  const token = getAuthToken();
  if (!token) throw new ApiError(401, "Not authenticated");

  const url = new URL(endpoint, BASE_URL);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) =>
      url.searchParams.set(k, v),
    );
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) useUserStore.getState().logout();
    throw new ApiError(res.status, `API error: ${res.status}`);
  }

  return res.json();
}
