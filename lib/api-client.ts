import { handleLogout } from "@/lib/server";

const BASE_URL = process.env.NEXT_PUBLIC_ECOM3_API_BASE_URL;

// Parse a cookie string and return the value for a given key
function readCookie(
  cookieString: string | undefined,
  key: string,
): string | null {
  if (!cookieString) return null;
  const cookie = cookieString
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${key}=`));
  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
}

// Safe to call in the browser; returns null on server
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  return readCookie(document.cookie, "token");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiClientOptions = {
  method?: HttpMethod;
  params?: Record<string, string>;
  body?: unknown;
};

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { method = "GET", params, body } = options;
  const token = getAuthToken();
  if (!token) throw new ApiError(401, "Not authenticated");

  const url = new URL(endpoint, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleLogout().then(({ redirectTo }) => {
        window.location.href = redirectTo;
      });
    }
    throw new ApiError(res.status, `API error: ${res.status}`);
  }

  return res.json();
}
