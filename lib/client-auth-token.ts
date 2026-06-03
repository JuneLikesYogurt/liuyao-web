/** 浏览器端鉴权 token：middleware 写 cookie，登录页双写 localStorage；优先 cookie。 */
export function getClientAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));

  if (match) {
    const raw = match.slice("token=".length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return window.localStorage.getItem("token");
}
