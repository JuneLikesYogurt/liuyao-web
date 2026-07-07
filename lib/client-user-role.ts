import { USER_ROLE_COOKIE } from "@/lib/auth-cookie";

export const USER_ROLE_KEY = "user_role";

function readRoleFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${USER_ROLE_COOKIE}=`));
  if (!match) return null;
  const raw = match.slice(`${USER_ROLE_COOKIE}=`.length);
  try {
    return decodeURIComponent(raw).trim() || null;
  } catch {
    return raw.trim() || null;
  }
}

export function getClientUserRole(): string | null {
  if (typeof window === "undefined") return null;
  const fromCookie = readRoleFromCookie();
  if (fromCookie) return fromCookie;
  const role = window.localStorage.getItem(USER_ROLE_KEY);
  return role && role.trim() ? role.trim() : null;
}

export function isClientAdmin(): boolean {
  return getClientUserRole() === "ADMIN";
}

export function setClientUserRole(role: string | null | undefined): void {
  if (typeof window === "undefined") return;
  if (role && role.trim()) {
    window.localStorage.setItem(USER_ROLE_KEY, role.trim());
  } else {
    window.localStorage.removeItem(USER_ROLE_KEY);
  }
}
