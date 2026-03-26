"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface RegisterResponse {
  token?: string;
  tokenType?: string;
  userId?: number;
  error?: string;
  message?: string;
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = (await res.json()) as RegisterResponse;

      if (!res.ok) {
        throw new Error(data.message || data.error || "注册失败");
      }

      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
      <Card className="w-full max-w-md border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">注册</CardTitle>
          <CardDescription>最小注册表单：提交后展示后端返回 token。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-800">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={64}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200"
                placeholder="请输入用户名"
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
              {loading ? "提交中..." : "注册"}
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {result && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-800">注册成功</p>
              <p className="mt-1 break-all text-slate-700">token: {result.token || "(空)"}</p>
              <p className="mt-1 text-slate-600">tokenType: {result.tokenType || "-"}</p>
              <p className="mt-1 text-slate-600">userId: {result.userId ?? "-"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
