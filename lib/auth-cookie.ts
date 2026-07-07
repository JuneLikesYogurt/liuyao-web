import { hasValidSessionToken } from "@/lib/session-token";

const TOKEN_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export const TOKEN_COOKIE = "token";
export const USER_ROLE_COOKIE = "user_role";

type SessionCookieStore = {
  set: (
    name: string,
    value: string,
    options: {
      path?: string;
      maxAge?: number;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
    }
  ) => void;
};

export function isAdminRole(role: string | null | undefined): boolean {
  return role?.trim() === "ADMIN";
}

export function secureFromProto(protoHeader: string | null): boolean {
  return protoHeader === "https";
}

/** Cookie attribute suffix for client document.cookie: SameSite=Lax; Secure on HTTPS. */
export function authCookieSuffix(): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; secure"
      : "";
  return `path=/; samesite=lax${secure}`;
}

export function applyServerSessionCookies(
  cookieStore: SessionCookieStore,
  opts: { token: string; role: string; secure: boolean }
): void {
  const common = {
    path: "/",
    maxAge: TOKEN_MAX_AGE_SEC,
    sameSite: "lax" as const,
    secure: opts.secure
  };
  cookieStore.set(TOKEN_COOKIE, opts.token, common);
  cookieStore.set(USER_ROLE_COOKIE, opts.role.trim() || "USER", common);
}

/** 登录成功后浏览器双写 cookie（与 API Route cookies().set 互补）。 */
export function writeClientSessionCookies(token: string, role: string): void {
  if (typeof window === "undefined") return;
  const suffix = authCookieSuffix();
  const normalizedRole = role.trim() || "USER";
  document.cookie = `${TOKEN_COOKIE}=${token}; max-age=${TOKEN_MAX_AGE_SEC}; ${suffix}`;
  document.cookie = `${USER_ROLE_COOKIE}=${encodeURIComponent(normalizedRole)}; max-age=${TOKEN_MAX_AGE_SEC}; ${suffix}`;
}

export function clearClientSessionCookies(): void {
  if (typeof window === "undefined") return;
  const suffix = authCookieSuffix();
  document.cookie = `${TOKEN_COOKIE}=; max-age=0; ${suffix}`;
  document.cookie = `${USER_ROLE_COOKIE}=; max-age=0; ${suffix}`;
}

/** 布局 SSR：有效 token + ADMIN 角色才显示管理 Tab。 */
export function isAdminSession(
  token: string | undefined,
  role: string | undefined
): boolean {
  return hasValidSessionToken(token) && isAdminRole(role);
}

export { TOKEN_MAX_AGE_SEC };
