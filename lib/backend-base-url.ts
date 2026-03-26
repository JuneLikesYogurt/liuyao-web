/**
 * Spring Boot API base URL (no trailing slash).
 * Prefer `API_BASE_URL` on the server; `NEXT_PUBLIC_API_BASE_URL` is accepted for parity with the draft.
 */
export function getBackendBaseUrl(): string {
  const raw =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8080";
  return raw.replace(/\/+$/, "");
}
