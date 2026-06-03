"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isClientAdmin } from "@/lib/client-user-role";

const baseNavItems = [
  { href: "/", label: "起卦" },
  { href: "/result", label: "结果" },
  { href: "/history", label: "历史记录" }
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const admin = isClientAdmin();

  const navItems = admin
    ? [...baseNavItems, { href: "/admin/history", label: "管理" }]
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
