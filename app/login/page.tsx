"use client";

import { FormEvent, Suspense, useState } from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { writeClientSessionCookies } from "@/lib/auth-cookie";
import { setClientUserRole } from "@/lib/client-user-role";

interface LoginResponse {
  token?: string;
  tokenType?: string;
  userId?: number;
  role?: string;
  error?: string;
  message?: string;
}

function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password })
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        throw new Error(data.message || data.error || "登录失败");
      }

      if (!data.token) {
        throw new Error("登录成功但未返回 token");
      }

      const role = data.role?.trim() || "USER";

      // Keep localStorage for existing API calls that read token in browser.
      window.localStorage.setItem("token", data.token);
      window.localStorage.setItem("user_label", identifier.trim());
      setClientUserRole(role);
      // Cookie for middleware + layout SSR; API route also sets via cookies().set().
      writeClientSessionCookies(data.token, role);

      const nextPath = searchParams.get("next");
      const target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/";
      // Full navigation so middleware sees the cookie (client router.push can race).
      window.location.assign(target);
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
      <Card className="w-full max-w-md border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">登录</CardTitle>
          <CardDescription>输入账号密码后完成登录并进入起卦页。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-800">
                账号（用户名/邮箱）
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                minLength={2}
                maxLength={64}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
                placeholder="请输入账号"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-800">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={128}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
                placeholder="请输入密码（至少 6 位）"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "登录中..." : "登录"}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/register">去注册</Link>
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
          <Card className="w-full max-w-md border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">登录</CardTitle>
              <CardDescription>加载中…</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
