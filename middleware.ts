import { NextRequest, NextResponse } from "next/server";

/**
 * Gets the login redirect URL for external authentication
 */
function getLoginRedirectUrl(): URL {
  const base =
    process.env.NEXT_PUBLIC_ACCOUNTS_LOGIN_URL ??
    "https://accounts.vamaship.com/sign-in";
  return new URL(base);
}

/**
 * Checks if a given path should be protected by authentication
 */
function isProtectedPath(pathname: string): boolean {
  // Allow public routes
  if (pathname === "/unauthorized") {
    return false;
  }
  // All other routes are protected
  return true;
}

/**
 * Main authentication middleware
 */
function authMiddleware(req: NextRequest): NextResponse {
  const url = req.nextUrl;
  const { pathname } = url;
  const tokenFromQuery = url.searchParams.get("token");
  const tokenCookie = req.cookies.get("token")?.value;

  // If token is present in the URL, set it as a cookie and clean the URL
  if (tokenFromQuery) {
    const cleanedUrl = new URL(url);
    cleanedUrl.searchParams.delete("token");
    const res = NextResponse.redirect(cleanedUrl);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookies.set("token", tokenFromQuery, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  // If accessing protected routes without a token, redirect to external login
  if (!tokenCookie && isProtectedPath(pathname)) {
    return NextResponse.redirect(getLoginRedirectUrl());
  }

  return NextResponse.next();
}

export function middleware(req: NextRequest) {
  return authMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

