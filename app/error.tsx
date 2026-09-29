"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page page--narrow system-state-page">
      <div className="empty-state">
        <span className="system-state-mark" aria-hidden="true">止</span>
        <strong>册页暂时无法展开</strong>
        <p>可能是网络或接口暂时不可用，请稍后再试。</p>
        <div className="system-state-actions">
          <button className="button" type="button" onClick={reset}>重新尝试</button>
          <Link className="button button--outline" href="/">返回起卦</Link>
        </div>
      </div>
    </div>
  );
}
