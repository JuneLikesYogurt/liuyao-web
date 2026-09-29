import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

import { AuthHeader } from "@/components/auth-header";
import { BrandMark } from "@/components/brand-mark";
import { SiteNav } from "@/components/site-nav";
import {
  isAdminSession,
  TOKEN_COOKIE,
  USER_ROLE_COOKIE
} from "@/lib/auth-cookie";

export const metadata: Metadata = {
  title: "三钱六掷 · 六爻排盘",
  description: "心有所问，掷钱成卦"
};

async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = isAdminSession(
    cookieStore.get(TOKEN_COOKIE)?.value,
    cookieStore.get(USER_ROLE_COOKIE)?.value
  );

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/prototype/styles.css" />
        <link rel="icon" type="image/svg+xml" href="/prototype/logo-mark.svg" />
      </head>
      <body>
        <div className="app-shell">
          <header className="top-nav" data-top-nav>
            <div className="top-nav__inner">
              <a className="brand" href="/" aria-label="三钱六掷首页">
                <BrandMark />
                <span className="brand__text">
                  <span className="brand__name">三钱六掷</span>
                  <span className="brand__desc">六爻排盘</span>
                </span>
              </a>
              <SiteNav isAdmin={isAdmin} />
              <AuthHeader />
            </div>
          </header>
          <header className="mobile-top">
            <a className="brand" href="/" aria-label="三钱六掷首页"><BrandMark /></a>
            <span className="mobile-top__title">三钱六掷</span>
            <a className="mobile-top__avatar" href="/me" aria-label="我的">人</a>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

export default RootLayout;
