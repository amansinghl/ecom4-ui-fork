// Parse a cookie string and return the value for a given key
export function readCookie(
  cookieString: string | undefined,
  key: string,
): string | null {
  if (!cookieString) return null;
  const cookie = cookieString
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${key}=`));
  const value = cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
  return value;
}

// Safe to call in the browser; returns null on server
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  return readCookie(document.cookie, "token");
}

