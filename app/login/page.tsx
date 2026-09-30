"use client";

import { FormEvent, Suspense, useState } from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

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
    <div className="page auth-page">
      <section className="auth-folio" aria-labelledby="login-title">
        <div className="auth-folio__brand">
          <BrandMark ritual />
          <p className="page-kicker">三枚钱 · 六次掷</p>
          <h1 id="login-title">登录</h1>
          <p>归来，再问一卦</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
            <label className="field-wrap" htmlFor="identifier">
              <span className="field-label">账号（用户名 / 邮箱）</span>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                minLength={2}
                maxLength={64}
                className="field"
                placeholder="请输入账号"
              />
            </label>

            <label className="field-wrap" htmlFor="password">
              <span className="field-label">密码</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={128}
                className="field"
                placeholder="请输入密码（至少 6 位）"
              />
            </label>

            {error && <p className="auth-message auth-message--error" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="button button--ink auth-submit">
              {loading ? "登录中..." : "登录"}
            </button>
            <p className="auth-switch">还没有账号？<Link href="/register">创建一页新册</Link></p>
        </form>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="page auth-page">
          <div className="auth-folio auth-folio--loading">正在展开册页…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
