"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearClientSessionCookies } from "@/lib/auth-cookie";
import { setClientUserRole } from "@/lib/client-user-role";
import { cn } from "@/lib/utils";

const AUTH_PATHS = new Set(["/login", "/register"]);

const baseNavItems = [
  { href: "/", label: "起卦" },
  { href: "/history", label: "历史记录" }
] as const;

const adminNavItem = { href: "/admin/history", label: "管理" } as const;

export interface SiteMenuProps {
  isAdmin: boolean;
}

export function SiteMenu({ isAdmin }: SiteMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const label = window.localStorage.getItem("user_label");
    setUserLabel(label && label.trim() ? label : null);
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (AUTH_PATHS.has(pathname)) {
    return null;
  }

  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;
  const displayName = userLabel?.trim() || "已登录";

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user_label");
    setClientUserRole(null);
    clearClientSessionCookies();
    window.location.assign("/login");
  };

  const drawer =
    mounted &&
    createPortal(
      <div
        className={cn(
          "fixed inset-0 z-[100]",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
        // 关闭时移出屏幕仍挂在 body，避免被读屏/Tab 扫到
        inert={!open ? true : undefined}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal={open}
          aria-label="菜单"
          className={cn(
            "absolute inset-y-0 right-0 grid w-[min(16rem,85vw)] grid-rows-[auto_1fr] border-l bg-background shadow-xl transition-transform duration-200 ease-out motion-reduce:transition-none",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="grid grid-cols-[1fr_auto] items-center border-b px-3 py-2">
            <p className="truncate text-sm font-medium">导航</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="关闭菜单"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="grid content-start gap-1 p-3" aria-label="站点">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-accent",
                    active &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              className="rounded-md px-3 py-2.5 text-left text-sm text-foreground hover:bg-accent"
              onClick={handleLogout}
            >
              登出
            </button>
          </nav>
        </aside>
      </div>,
      document.body
    );

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="max-w-[7rem] truncate text-xs text-muted-foreground sm:max-w-[9rem]">
        {displayName}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="菜单"
        onClick={() => setOpen((v) => !v)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {drawer}
    </div>
  );
}
