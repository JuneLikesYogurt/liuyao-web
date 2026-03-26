"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface LoginResponse {
  token?: string;
  tokenType?: string;
  userId?: number;
  error?: string;
  message?: string;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        throw new Error(data.message || data.error || "登录失败");
      }

      if (!data.token) {
        throw new Error("登录成功但未返回 token");
      }

      // Stage 2 requirement: store token locally (simple first iteration).
      window.localStorage.setItem("token", data.token);

      router.push("/");
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
          <CardDescription>输入账号密码后，成功写入 token 到 localStorage。</CardDescription>
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
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

