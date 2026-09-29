"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, History, ShieldCheck, UserRound } from "lucide-react";

const baseNavItems = [
  { href: "/", label: "起卦", icon: Coins },
  { href: "/history", label: "排盘记录", icon: History },
  { href: "/me", label: "我的", icon: UserRound }
] as const;

const adminNavItem = { href: "/admin/history", label: "管理", icon: ShieldCheck } as const;

const AUTH_PATHS = new Set(["/login", "/register"]);

export interface SiteNavProps {
  /** 由服务端 layout 根据 user_role cookie 注入，首屏即正确 Tab 数。 */
  isAdmin: boolean;
}

export function SiteNav({ isAdmin }: SiteNavProps) {
  const pathname = usePathname();
  // 登录/注册页不展示管理 Tab（登出后 cookie 清空前 layout 仍可能带 isAdmin）。
  const showAdmin = isAdmin && !AUTH_PATHS.has(pathname);
  if (AUTH_PATHS.has(pathname)) return null;

  const navItems = showAdmin
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;

  const links = (mobile = false) => navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={mobile ? "bottom-nav__item" : "nav-link"}
            aria-current={active ? "page" : undefined}
          >
            {mobile && <Icon className="icon" aria-hidden="true" />}
            <span>{item.label}</span>
          </Link>
        );
      });

  return (
    <>
      <nav className="top-nav__links" aria-label="一级导航">{links()}</nav>
      <nav className="bottom-nav" aria-label="手机端一级导航">{links(true)}</nav>
    </>
  );
}
