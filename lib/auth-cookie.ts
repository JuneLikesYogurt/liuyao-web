const TOKEN_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Cookie attribute suffix for auth token: SameSite=Lax; Secure on HTTPS. */
export function authCookieSuffix(): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; secure"
      : "";
  return `path=/; samesite=lax${secure}`;
}

/** Build Set-Cookie for login API (reads X-Forwarded-Proto behind Nginx). */
export function buildAuthSetCookie(token: string, protoHeader: string | null): string {
  const secure = protoHeader === "https" ? "; Secure" : "";
  return `token=${token}; Path=/; Max-Age=${TOKEN_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export { TOKEN_MAX_AGE_SEC };
