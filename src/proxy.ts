import { NextRequest, NextResponse } from "next/server";

const sessionCookieNames = ["__Host-bookleaf_session", "bookleaf_session"];

export function proxy(request: NextRequest) {
  const hasSession = sessionCookieNames.some((name) =>
    request.cookies.has(name),
  );

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/author/:path*"],
};
