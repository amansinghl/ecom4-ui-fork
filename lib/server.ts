"use server";

import { cookies } from "next/headers";

export async function handleLogout(): Promise<{ redirectTo: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const accountsBase =
    process.env.NEXT_PUBLIC_ACCOUNTS_LOGIN_URL ??
    "https://accounts.vamaship.com/";
  const accountsLogoutUrl = new URL("api/v2/logout", accountsBase);

  if (token) {
    accountsLogoutUrl.searchParams.set("token", token);
  }
  accountsLogoutUrl.searchParams.set(
    "returnTo",
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080/",
  );

  // Clear auth token cookie
  cookieStore.set("token", "", {
    path: "/",
    maxAge: 0,
  });

  return { redirectTo: accountsLogoutUrl.toString() };
}
