import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

import { SiteMenu } from "@/components/site-menu";
import {
  isAdminSession,
  TOKEN_COOKIE,
  USER_ROLE_COOKIE
} from "@/lib/auth-cookie";

export const metadata: Metadata = {
  title: "六爻排盘 · 在线占卜",
  description: "基于六爻的在线起卦与排盘工具"
};

async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = isAdminSession(
    cookieStore.get(TOKEN_COOKIE)?.value,
    cookieStore.get(USER_ROLE_COOKIE)?.value
  );

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-background via-background to-muted text-foreground">
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-background/80 backdrop-blur">
            <div className="grid h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  卦
                </span>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="text-base font-semibold tracking-tight">
                    六爻排盘
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    起卦 · 排盘 · 反馈记录
                  </span>
                </div>
              </div>

              <SiteMenu isAdmin={isAdmin} />
            </div>
          </header>

          <main className="container flex-1 py-6 sm:py-10">
            {children}
          </main>

          <footer className="border-t bg-background/80 py-4 text-center text-xs text-muted-foreground">
            <div className="container flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span>© {new Date().getFullYear()} 六爻排盘</span>
              {/* <span className="text-[11px]">
                前端基于 Next.js · TailwindCSS · shadcn/ui
              </span> */}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

export default RootLayout;
