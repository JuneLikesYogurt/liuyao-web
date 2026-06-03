export const USER_ROLE_KEY = "user_role";

export function getClientUserRole(): string | null {
  if (typeof window === "undefined") return null;
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
