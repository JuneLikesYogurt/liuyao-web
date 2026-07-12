"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/", label: "起卦" },
  { href: "/result", label: "结果" },
  { href: "/history", label: "历史记录" }
] as const;

const adminNavItem = { href: "/admin/history", label: "管理" } as const;

const AUTH_PATHS = new Set(["/login", "/register"]);

export interface SiteNavProps {
  /** 由服务端 layout 根据 user_role cookie 注入，首屏即正确 Tab 数。 */
  isAdmin: boolean;
}

export function SiteNav({ isAdmin }: SiteNavProps) {
  const pathname = usePathname();

  // 登录/注册页不展示导航 Tab。
  if (AUTH_PATHS.has(pathname)) {
    return null;
  }

  const navItems = isAdmin
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  return (
    <nav className="flex items-center gap-1 rounded-full border bg-card px-1 py-1 text-sm shadow-sm">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              active && "bg-primary text-primary-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
