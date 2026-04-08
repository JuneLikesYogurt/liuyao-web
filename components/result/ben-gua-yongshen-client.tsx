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
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const confirmSubmitLock = useRef(false);

  const handleBenYaoClick = (yaoPos: number) => {
    setSelectedYao(yaoPos);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmOpen(false);
    setSelectedYao(null);
  };

  const handleConfirmOk = async () => {
    if (selectedYao == null || confirmSubmitLock.current) return;
    confirmSubmitLock.current = true;
    const yao = selectedYao;
    setConfirmOpen(false);
    setCalcError(null);
    setCalcResult(null);
    setCalcLoading(true);
    try {
      const value = await fetchCountYongshen({ liuyaoId, yongshen: yao });
      setCalcResult(`用神计数：${value}`);
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : "计算失败");
    } finally {
      setCalcLoading(false);
      confirmSubmitLock.current = false;
    }
  };

  const dialogLiuqin =
    selectedYao != null
      ? benLines.find((r) => r.yaoPos === selectedYao)?.liuqin ?? "—"
      : "—";

  return (
    <>
      <section
        className="overflow-x-auto rounded-xl bg-white/90 p-4 shadow-sm sm:p-5"
        data-liuyao-id={liuyaoId}
      >
        <p className="mb-3 text-[11px] text-muted-foreground">
          点选<strong className="text-foreground">本卦</strong>
          某一爻作为用神，确认后在下方展示用神计数（需后端服务可用）。
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
        aria-label="用神结果"
      >
        <div className="text-[11px] font-medium text-foreground">用神结果</div>
        <p className="mt-2 text-xs leading-relaxed">
          {calcLoading ? (
            "计算中…"
          ) : calcError ? (
            <span className="text-destructive">{calcError}</span>
          ) : (
            calcResult ??
            "请先在本卦中点选一爻；确认用神后，此处将展示计算结果。"
          )}
        </p>
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
