export default function Loading() {
  return (
    <div className="page page--narrow system-state-page" aria-live="polite">
      <div className="empty-state">
        <span className="system-state-mark" aria-hidden="true">卦</span>
        <strong>正在展开册页</strong>
        <p>请稍候，正在读取内容。</p>
      </div>
    </div>
  );
}
