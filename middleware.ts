import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const normalized = pad === 0 ? base64 : `${base64}${"=".repeat(4 - pad)}`;

  try {
    const json = atob(normalized);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** UX 门禁：非安全边界；不校验 HMAC，与后端 JwtService 验签无关。 */
function hasValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;

  const exp = payload.exp;
  if (typeof exp !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  return exp > now;
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
