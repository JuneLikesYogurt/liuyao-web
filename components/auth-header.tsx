"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { clearClientSessionCookies } from "@/lib/auth-cookie";
import { setClientUserRole } from "@/lib/client-user-role";

export function AuthHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    const label = window.localStorage.getItem("user_label");
    setUserLabel(label && label.trim() ? label : null);
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user_label");
    setClientUserRole(null);
    clearClientSessionCookies();
    router.push("/login");
  };

  return (
    <div className="top-nav__user">
      <span className="avatar">{userLabel?.trim().slice(0, 1) || "人"}</span>
      <span>{userLabel || "已登录"}</span>
      <button className="icon-button" type="button" onClick={handleLogout} aria-label="退出登录">
        <LogOut className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
