import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // check session cookie
    const session =
        req.cookies.get("better-auth.session_token")?.value ||
        req.cookies.get("__Secure-better-auth.session_token")?.value ||
        req.cookies.get("better-auth.session_data")?.value ||
        req.cookies.get("__Secure-better-auth.session_data")?.value;

    if (!session) {
        const loginUrl = new URL("/signin", req.url);
        loginUrl.searchParams.set("redirect", pathname + search);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - next internals
         * - static files (images, fonts, etc)
         */
        "/((?!api|_next|.*\\..*).*)",
    ],
};
