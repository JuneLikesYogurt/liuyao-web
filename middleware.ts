import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasValidSessionToken } from "@/lib/session-token";

function firstHeader(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.split(",")[0]?.trim();
  return trimmed || null;
}

function isLocalHost(host: string): boolean {
  return /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(host);
}

/** Behind Nginx: build public origin for redirects (avoid 127.0.0.1:3000 / http downgrade). */
function requestOrigin(request: NextRequest): string {
  const host =
    firstHeader(request.headers.get("x-forwarded-host")) ??
    firstHeader(request.headers.get("host"));
  let proto =
    firstHeader(request.headers.get("x-forwarded-proto")) ??
    request.nextUrl.protocol.replace(":", "");

  if (host && !isLocalHost(host) && proto === "http") {
    proto = "https";
  }

  if (host) {
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

function redirectPublic(request: NextRequest, targetPath: string): NextResponse {
  const location = new URL(targetPath, `${requestOrigin(request)}/`).toString();
  return NextResponse.redirect(location);
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
    if (nextParam) {
      return redirectPublic(request, nextParam);
    }
    return redirectPublic(request, "/");
  }

  if (authed) {
    return NextResponse.next();
  }

  const next = `${pathname}${search}`;
  const loginTarget = `/login?next=${encodeURIComponent(next)}`;
  return redirectPublic(request, loginTarget);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
