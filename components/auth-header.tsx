"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

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
    document.cookie = "token=; path=/; max-age=0; samesite=lax";
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[9rem] truncate text-xs text-muted-foreground sm:inline">
        {userLabel ? `已登录：${userLabel}` : "已登录"}
      </span>
      <Button type="button" size="sm" variant="outline" onClick={handleLogout}>
        登出
      </Button>
    </div>
  );
}
