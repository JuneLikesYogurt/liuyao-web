"use client";

import { useRef, useState } from "react";

import type { GuaYaoRow } from "@/components/result/gua-module";
import { GuaModule } from "@/components/result/gua-module";
import { LiuShouColumn } from "@/components/result/liu-shou-column";
import { MovingColumn } from "@/components/result/moving-column";
import { Button } from "@/components/ui/button";
import { fetchCountYongshen } from "@/lib/api";
import { yaoWeiLabel } from "@/lib/yao-wei";

type MovingRow = {
  isMoving: boolean;
  benguaIsYang: boolean;
  showArrow: boolean;
};

export function BenGuaYongShenClient({
  liuyaoId,
  liushouLabels,
  benLines,
  bianLines,
  hasBian,
  movingRows,
  benName,
  bianName
}: {
  liuyaoId: string;
  liushouLabels: string[];
  benLines: GuaYaoRow[];
  bianLines: GuaYaoRow[];
  hasBian: boolean;
  movingRows: MovingRow[];
  benName: string;
  bianName: string;
}) {
  const [selectedYao, setSelectedYao] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  /** 当前结果区对应的用神爻位（确认后写入，用于标题「以 xx 爻为用神的计算结果」） */
  const [outcomeYao, setOutcomeYao] = useState<number | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [countValue, setCountValue] = useState<number | null>(null);
  const confirmSubmitLock = useRef(false);

  const liuqinForYao = (yaoPos: number) =>
    benLines.find((r) => r.yaoPos === yaoPos)?.liuqin ?? "—";

  const runCountYongshen = async (yao: number) => {
    if (confirmSubmitLock.current) return;
    confirmSubmitLock.current = true;
    setOutcomeYao(yao);
    setCalcError(null);
    setCountValue(null);
    setCalcLoading(true);
    try {
      const value = await fetchCountYongshen({ liuyaoId, yongshen: yao });
      setCountValue(value);
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : "计算失败");
    } finally {
      setCalcLoading(false);
      confirmSubmitLock.current = false;
    }
  };

  const handleBenYaoClick = (yaoPos: number) => {
    setSelectedYao(yaoPos);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    setSelectedYao(null);
  };

  const handleConfirmOk = async () => {
    if (selectedYao == null) return;
    setConfirmOpen(false);
    await runCountYongshen(selectedYao);
  };

  const handleRetry = () => {
    if (outcomeYao == null) return;
    void runCountYongshen(outcomeYao);
  };

  const dialogLiuqin =
    selectedYao != null ? liuqinForYao(selectedYao) : "—";

  const headingMain =
    outcomeYao != null
      ? `以${yaoWeiLabel(outcomeYao)}为用神的计算结果`
      : "用神结果";
  const headingSub =
    outcomeYao != null ? `· ${liuqinForYao(outcomeYao)}` : null;

  return (
    <>
      <section
        className="overflow-x-auto rounded-xl bg-white/90 p-4 shadow-sm sm:p-5"
        data-liuyao-id={liuyaoId}
      >
        <p className="mb-3 text-[11px] text-muted-foreground">
          点选<strong className="text-foreground">本卦</strong>
          某一爻作为用神，确认后在下方展示用神计数（需后端服务可用）。换用神请点选其他爻后再次确认。
        </p>
        <div className="flex min-w-[min(100%,42rem)] items-start gap-2 sm:gap-3">
          <LiuShouColumn labels={liushouLabels} />
          <GuaModule
            name={benName}
            lines={benLines}
            variant="ben"
            selectableBen
            selectedYao={selectedYao}
            onBenYaoClick={handleBenYaoClick}
          />
          {hasBian && (
            <>
              <MovingColumn rows={movingRows} />
              <GuaModule
                name={bianName}
                lines={bianLines}
                variant="bian"
              />
            </>
          )}
        </div>
      </section>

      <section
        className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground"
        aria-busy={calcLoading}
        aria-live="polite"
        aria-label={outcomeYao != null ? headingMain : "用神结果"}
      >
        <div>
          <div className="text-[11px] font-medium text-foreground">
            {headingMain}
          </div>
          {headingSub && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {headingSub}
            </div>
          )}
        </div>

        <div className="mt-2 text-xs leading-relaxed">
          {calcLoading ? (
            <p className="text-muted-foreground">请求中…</p>
          ) : calcError ? (
            <div className="space-y-2">
              <p className="text-destructive">{calcError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleRetry}
              >
                重试
              </Button>
            </div>
          ) : countValue != null ? (
            <p className="text-foreground">
              用神计数：<span className="tabular-nums">{countValue}</span>
            </p>
          ) : (
            <p>
              请先在本卦中点选一爻，确认后此处将展示计算结果。
            </p>
          )}
        </div>
      </section>

      {confirmOpen && selectedYao != null && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden
            onClick={handleConfirmCancel}
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-4 text-sm shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="yongshen-confirm-title"
          >
            <h2 id="yongshen-confirm-title" className="font-medium text-foreground">
              确认用神
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              是否以「{yaoWeiLabel(selectedYao)} · {dialogLiuqin}」为用神进行计算？
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleConfirmCancel}>
                取消
              </Button>
              <Button
                type="button"
                disabled={calcLoading}
                onClick={() => void handleConfirmOk()}
              >
                确认
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
