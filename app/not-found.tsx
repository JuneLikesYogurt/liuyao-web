import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page page--narrow system-state-page">
      <div className="empty-state">
        <span className="system-state-mark" aria-hidden="true">空</span>
        <strong>此页未入册</strong>
        <p>你访问的页面不存在，或已经更换了位置。</p>
        <Link className="button" href="/">返回起卦</Link>
      </div>
    </div>
  );
}
