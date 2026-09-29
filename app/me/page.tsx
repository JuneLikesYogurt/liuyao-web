"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BookOpen, LogOut, ShieldCheck, Sparkles } from "lucide-react";

import { clearClientSessionCookies } from "@/lib/auth-cookie";
import { getClientUserRole, setClientUserRole } from "@/lib/client-user-role";

const PREF_KEY = "guanyao-ui-prefs-v1";

type Preferences = {
  motion: boolean;
  sound: boolean;
  haptic: boolean;
};

const defaultPreferences: Preferences = {
  motion: true,
  sound: false,
  haptic: true
};

function readPreferences(): Preferences {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PREF_KEY) || "{}");
    return { ...defaultPreferences, ...stored };
  } catch {
    return defaultPreferences;
  }
}

export default function MePage() {
  const router = useRouter();
  const [userLabel, setUserLabel] = useState("已登录用户");
  const [role, setRole] = useState("USER");
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const label = window.localStorage.getItem("user_label")?.trim();
    setUserLabel(label || "已登录用户");
    setRole(getClientUserRole() || "USER");
    setPrefs(readPreferences());
  }, []);

  const updatePreference = (key: keyof Preferences) => {
    setPrefs((current) => {
      const next = { ...current, [key]: !current[key] };
      window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
      document.documentElement.classList.toggle("reduce-motion", !next.motion);
      return next;
    });
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user_label");
    setClientUserRole(null);
    clearClientSessionCookies();
    router.push("/login");
  };

  return (
    <div className="page page--narrow profile-page">
      <div className="page-head">
        <div>
          <p className="page-kicker">个人册页</p>
          <h1 className="page-title">我的</h1>
          <p className="page-subtitle">管理账户与起卦体验偏好。</p>
        </div>
        <Link className="button" href="/">再起一卦</Link>
      </div>

      <div className="profile-grid">
        <aside className="profile-card">
          <div className="profile-user">
            <span className="avatar">{userLabel.slice(0, 1)}</span>
            <div>
              <h2>{userLabel}</h2>
              <p>{role === "ADMIN" ? "管理员账户" : "已登录账户"}</p>
            </div>
          </div>
          <div className="profile-links">
            <Link href="/history"><BookOpen className="icon" aria-hidden="true" />查看我的排盘记录<span>→</span></Link>
            {role === "ADMIN" && <Link href="/admin/history"><ShieldCheck className="icon" aria-hidden="true" />进入卦例管理<span>→</span></Link>}
          </div>
        </aside>

        <section className="settings-panel">
          <div className="settings-group">
            <h2>体验偏好</h2>
            <div className="setting-row">
              <div className="setting-copy"><strong><Sparkles className="icon" aria-hidden="true" />界面动效</strong><span>关闭后减少投掷和页面过渡动画。</span></div>
              <button className="switch" type="button" role="switch" aria-label="界面动效" aria-checked={prefs.motion} onClick={() => updatePreference("motion")} />
            </div>
            <div className="setting-row">
              <div className="setting-copy"><strong>轻触反馈</strong><span>支持的手机在铜钱落定时提供短促震动。</span></div>
              <button className="switch" type="button" role="switch" aria-label="轻触反馈" aria-checked={prefs.haptic} onClick={() => updatePreference("haptic")} />
            </div>
          </div>
          <div className="settings-group">
            <h2>账户</h2>
            <div className="setting-row">
              <div className="setting-copy"><strong>登录状态</strong><span>当前账户会保存和读取自己的排盘记录。</span></div>
              <span className="account-state">已登录</span>
            </div>
            <div className="account-actions">
              <button className="button button--outline" type="button" onClick={handleLogout}><LogOut className="icon" aria-hidden="true" />退出登录</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
