"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface RegisterResponse {
  error?: string;
  message?: string;
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setSuccess(false);
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

      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
        <Card className="w-full max-w-md border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">注册</CardTitle>
            <CardDescription>创建账号后返回登录页继续使用。</CardDescription>
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
          </CardContent>
        </Card>
      </div>

      {success && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-success-title"
        >
          <Card className="w-full max-w-sm border-slate-200/80 bg-white shadow-lg">
            <CardHeader>
              <CardTitle id="register-success-title" className="text-lg">
                注册成功
              </CardTitle>
              <CardDescription>请返回登录页完成登录。</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" className="w-full" asChild>
                <Link href="/login">返回登录</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
