import Link from "next/link";

import { getLiuYaoDetail } from "@/lib/get-liuyao-detail";
import { BenGuaDetailContent } from "@/components/result/ben-gua-detail";

interface ResultPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function parseMoving(mingdong: string | null | undefined): number[] {
  if (!mingdong) return [];
  return mingdong
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
}

async function ResultPage({ searchParams }: ResultPageProps) {
  const sp = await searchParams;
  const idParam = sp.liuyao_id;
  const liuyaoId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!liuyaoId) {
    return (
      <div className="page page--narrow"><div className="empty-state"><strong>尚未取得卦象</strong><p>请从起卦页面开始排盘。</p><Link href="/" className="button">返回起卦</Link></div>
      </div>
    );
  }

  const detail = await getLiuYaoDetail(liuyaoId);
  const moving = parseMoving(detail.mingdong);
  const benguaGuaId = detail.bengua?.gua_id ?? "";
  const bianguaGuaId = detail.biangua?.gua_id ?? "";

  return (
    <div className="page detail-page real-detail-page">
      <nav className="detail-index" aria-label="卦例页内导航"><div className="detail-index__inner"><a className="detail-index__link" href="#pan" aria-current="true">六爻排盘</a><a className="detail-index__link" href="#feedback">反馈与回看</a></div></nav>
      <div className="detail-grid">
        <aside className="reading-board" aria-label="排盘结果">
          <div className="reading-board__title"><div className="reading-board__folio"><span>六爻排盘</span><i>真实卦例</i></div><h1 className="reading-board__question">{detail.title || "未命名卦例"}</h1><div className="reading-board__meta"><span>{detail.date ?? "—"}</span><span>编号 {liuyaoId}</span></div></div>
          <div className="pillars"><div className="pillar-cell pillar-cell--label">四柱</div>{[["年柱", detail.year],["月柱", detail.month],["日柱", detail.day],["时柱", detail.hour]].map(([label, value]) => <div className="pillar-cell" key={label}><strong>{value ?? "—"}</strong><small>{label}</small></div>)}</div>
          <div className="real-pan" id="pan">
          {detail.bengua ? (
            <BenGuaDetailContent
              liuyaoId={String(liuyaoId)}
              detail={detail}
              moving={moving}
              benguaGuaId={benguaGuaId}
              bianguaGuaId={bianguaGuaId}
            />
          ) : <div className="empty-state"><strong>排盘数据尚未返回</strong></div>}
          </div>
          <div className="board-foot"><span>旬空：{detail.xunkong ?? "—"}</span><span>动爻：{moving.length ? moving.join("、") : "无"}</span></div>
        </aside>
        <article className="detail-content real-detail-notes">
          <section className="result-overview detail-section"><div className="result-overview__heading"><div><p className="page-kicker">成卦摘要</p><h2 className="page-title">{detail.title || "未命名卦例"}</h2></div><span className="result-overview__seal">已成卦</span></div>
            <div className="real-hex-pair"><div><span>本卦</span><strong>{detail.bengua?.name ?? "—"}</strong><small>{detail.bengua?.guagong ?? "—"}</small></div><i>之</i><div><span>变卦</span><strong>{detail.biangua?.name ?? "无变卦"}</strong><small>{detail.biangua?.guagong ?? "—"}</small></div></div>
            <div className="moving-note"><span>动爻</span><strong>{moving.length ? moving.join("、") : "无动爻"}</strong><p>点选左侧本卦爻位，可设置用神并记录后续反馈。</p></div>
          </section>
          <section className="detail-section" id="feedback"><div className="detail-section__head"><div><p className="page-kicker">回看</p><h2 className="section-title">反馈与记录</h2></div></div><p>左侧排盘下方可选择用神、重新计算，并保存本次复盘。</p></section>
          <div className="feedback-actions"><Link href="/history" className="button">返回排盘记录</Link><Link href="/" className="button button--outline">再起一卦</Link></div>
        </article>
      </div>
    </div>
  );
}

export default ResultPage;
