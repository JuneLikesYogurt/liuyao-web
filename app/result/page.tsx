import Link from "next/link";

import { BenGuaDetailContent } from "@/components/result/ben-gua-detail";
import { YongshenDayZhiTrend } from "@/components/result/yongshen-day-zhi-trend";
import { YongshenTrendProvider } from "@/components/result/yongshen-trend-context";
import { getLiuYaoDetail } from "@/lib/get-liuyao-detail";

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
      <nav className="detail-index" aria-label="卦例页内导航"><div className="detail-index__inner"><a className="detail-index__link" href="#pan" aria-current="true">六爻排盘</a><a className="detail-index__link" href="#feedback">回看留记</a><a className="detail-index__link" href="#trend">日月趋势</a></div></nav>
      <YongshenTrendProvider>
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
          <div id="yongshen-feedback-slot" />
          <YongshenDayZhiTrend liuyaoId={String(liuyaoId)} />
          <div className="feedback-actions"><Link href="/history" className="button">返回排盘记录</Link><Link href="/" className="button button--outline">再起一卦</Link></div>
        </article>
      </div>
      </YongshenTrendProvider>
    </div>
  );
}

export default ResultPage;
