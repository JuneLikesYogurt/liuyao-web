import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasValidSessionToken } from "@/lib/session-token";

/** Behind Nginx: use forwarded host/proto so redirects stay on the public URL, not 127.0.0.1:3000. */
function requestOrigin(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  if (host) {
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

/** 路由守卫：仅根据 JWT payload 的 exp 判断「是否像已登录」，不解签；身份以 Spring 验签为准。 */
function safeInternalNext(nextParam: string | null): string | null {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return null;
  }
  return nextParam;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const authed = hasValidSessionToken(token);

  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // API routes should return API responses (401/JSON), not login HTML redirects.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/register") {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (!authed) {
      return NextResponse.next();
    }
    const nextParam = safeInternalNext(request.nextUrl.searchParams.get("next"));
    const origin = `${requestOrigin(request)}/`;
    if (nextParam) {
      return NextResponse.redirect(new URL(nextParam, origin));
    }
    return NextResponse.redirect(new URL("/", origin));
  }

  if (authed) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", `${requestOrigin(request)}/`);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
