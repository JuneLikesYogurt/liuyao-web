"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

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
    <div className="page auth-page">
      <section className="auth-folio" aria-labelledby="register-title">
        <div className="auth-folio__brand">
          <BrandMark ritual />
          <p className="page-kicker">新客题名</p>
          <h1 id="register-title">注册</h1>
          <p>为每一卦，留一页可回看的记录</p>
        </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="field-wrap" htmlFor="username">
                <span className="field-label">用户名</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={2}
                  maxLength={64}
                  className="field"
                  placeholder="请输入用户名"
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
                {loading ? "提交中..." : "注册"}
              </button>
              <p className="auth-switch">已有账号？<Link href="/login">返回登录</Link></p>
            </form>
      </section>

      {success && (
        <div className="ritual-dialog-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-success-title"
        >
          <section className="ritual-dialog">
            <span className="ritual-dialog__seal" aria-hidden="true">成</span>
            <p className="page-kicker">题名已录</p>
            <h2 id="register-success-title">注册成功</h2>
            <p>请返回登录页，继续完成登录。</p>
            <div className="ritual-dialog__actions"><Link className="button button--ink" href="/login">返回登录</Link></div>
          </section>
        </div>
      )}
    </div>
  );
}
