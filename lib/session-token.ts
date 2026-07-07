/** UX 门禁：仅解码 JWT payload 并校验 exp，不解签；与 middleware / 布局 SSR 共用。 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
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

export function hasValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;

  const exp = payload.exp;
  if (typeof exp !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  return exp > now;
}
