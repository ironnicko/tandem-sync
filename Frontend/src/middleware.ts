import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/signin", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allow public routes
  if (pathname === "/"|| PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // ignore next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("better-auth.session")?.value;

  if (!session) {
    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
