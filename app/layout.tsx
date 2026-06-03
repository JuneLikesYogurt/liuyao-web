import type { Metadata } from "next";
import "./globals.css";

import { AuthHeader } from "@/components/auth-header";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "六爻起卦 · 在线占卜",
  description: "基于六爻的在线起卦与解卦工具"
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-background via-background to-muted text-foreground">
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-background/80 backdrop-blur">
            <div className="container flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  卦
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-semibold tracking-tight">
                    六爻起卦
                  </span>
                  <span className="text-xs text-muted-foreground">
                    轻量 · 专注 · 多端适配
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <SiteNav />
                <AuthHeader />
              </div>
            </div>
          </header>

          <main className="container flex-1 py-6 sm:py-10">
            {children}
          </main>

          <footer className="border-t bg-background/80 py-4 text-center text-xs text-muted-foreground">
            <div className="container flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span>© {new Date().getFullYear()} 六爻起卦</span>
              <span className="text-[11px]">
                前端基于 Next.js · TailwindCSS · shadcn/ui
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

export default RootLayout;

