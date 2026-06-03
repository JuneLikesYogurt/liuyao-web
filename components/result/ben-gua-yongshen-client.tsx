"use client";

import { useMemo, useRef, useState } from "react";

import { GuaFeedbackPanel } from "@/components/result/gua-feedback-panel";
import type { GuaYaoRow } from "@/components/result/gua-module";
import { ResultPanGrid } from "@/components/result/result-pan-grid";
import { Button } from "@/components/ui/button";
import {
  fetchCountYongshen,
  saveResultFeedback,
  type YongshenRecord
} from "@/lib/api";
import { yaoWeiLabel } from "@/lib/yao-wei";

type MovingRow = {
  isMoving: boolean;
  benguaIsYang: boolean;
  showArrow: boolean;
};

function recordsByYao(records: YongshenRecord[] | undefined) {
  const map = new Map<number, YongshenRecord>();
  for (const row of records ?? []) {
    if (row.yongshen >= 1 && row.yongshen <= 6) {
      map.set(row.yongshen, row);
    }
  }
  return map;
}

export function BenGuaYongShenClient({
  liuyaoId,
  initialComment,
  initialYongshenRecords,
  liushouLabels,
  benLines,
  bianLines,
  hasBian,
  movingRows,
  benName,
  bianName
}: {
  liuyaoId: string;
  initialComment?: string | null;
  initialYongshenRecords?: YongshenRecord[] | null;
  liushouLabels: string[];
  benLines: GuaYaoRow[];
  bianLines: GuaYaoRow[];
  hasBian: boolean;
  movingRows: MovingRow[];
  benName: string;
  bianName: string;
}) {
  const initialRecordMap = useMemo(
    () => recordsByYao(initialYongshenRecords ?? undefined),
    [initialYongshenRecords]
  );

  const [selectedYao, setSelectedYao] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [outcomeYao, setOutcomeYao] = useState<number | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [countValue, setCountValue] = useState<number | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const [comment, setComment] = useState(initialComment ?? "");
  const [recordMap, setRecordMap] = useState(initialRecordMap);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const confirmSubmitLock = useRef(false);

  const liuqinForYao = (yaoPos: number) =>
    benLines.find((r) => r.yaoPos === yaoPos)?.liuqin ?? "—";

  const applyYongshenSelection = (yao: number) => {
    const record = recordMap.get(yao);
    setSelectedYao(yao);
    setOutcomeYao(yao);
    setCalcError(null);
    setSaveError(null);
    if (record) {
      setCountValue(record.count_value);
      setFeedbackCorrect(record.feedback_correct ?? null);
    } else {
      setCountValue(null);
      setFeedbackCorrect(null);
    }
  };

  const runCountYongshen = async (yao: number) => {
    if (confirmSubmitLock.current) return;
    confirmSubmitLock.current = true;
    setOutcomeYao(yao);
    setSelectedYao(yao);
    setCalcError(null);
    setSaveError(null);
    setCalcLoading(true);
    try {
      const value = await fetchCountYongshen({ liuyaoId, yongshen: yao });
      const existingFeedback =
        recordMap.get(yao)?.feedback_correct ?? null;
      setCountValue(value);
      setFeedbackCorrect(existingFeedback);
      setRecordMap((prev) => {
        const next = new Map(prev);
        const existing = next.get(yao);
        next.set(yao, {
          yongshen: yao,
          count_value: value,
          feedback_correct: existing?.feedback_correct ?? null,
          feedback_time: existing?.feedback_time ?? null
        });
        return next;
      });
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : "计算失败");
    } finally {
      setCalcLoading(false);
      confirmSubmitLock.current = false;
    }
  };

  const handleBenYaoClick = (yaoPos: number) => {
    const record = recordMap.get(yaoPos);
    if (record) {
      applyYongshenSelection(yaoPos);
      return;
    }
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

  const handleRecalculate = () => {
    if (outcomeYao == null) return;
    void runCountYongshen(outcomeYao);
  };

  const handleSaveFeedback = async () => {
    const canSaveYongshenFeedback =
      outcomeYao != null && countValue != null && !calcLoading;
    setSaving(true);
    setSaveError(null);
    try {
      await saveResultFeedback({
        liuyaoId,
        yongshen: canSaveYongshenFeedback ? outcomeYao : 0,
        feedback_correct: canSaveYongshenFeedback ? feedbackCorrect : null,
        comment
      });
      if (canSaveYongshenFeedback && outcomeYao != null && countValue != null) {
        setRecordMap((prev) => {
          const next = new Map(prev);
          next.set(outcomeYao, {
            yongshen: outcomeYao,
            count_value: countValue,
            feedback_correct: feedbackCorrect,
            feedback_time: new Date().toISOString()
          });
          return next;
        });
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const dialogLiuqin =
    selectedYao != null ? liuqinForYao(selectedYao) : "—";

  return (
    <>
      <section
        className="overflow-x-auto rounded-xl bg-white/90 p-4 shadow-sm sm:p-5"
        data-liuyao-id={liuyaoId}
      >
        <p className="mb-3 text-[11px] text-muted-foreground">
          点选<strong className="text-foreground">本卦</strong>
          某一爻作为用神；已算过的爻可直接回显，未算过的需确认后计算。下方可填写应验与反馈记录。
        </p>
        <ResultPanGrid
          liushouLabels={liushouLabels}
          benName={benName}
          benLines={benLines}
          hasBian={hasBian}
          movingRows={movingRows}
          bianName={bianName}
          bianLines={bianLines}
          selectedYao={selectedYao}
          onBenYaoClick={handleBenYaoClick}
        />
      </section>

      <GuaFeedbackPanel
        yongshen={outcomeYao}
        liuqin={outcomeYao != null ? liuqinForYao(outcomeYao) : undefined}
        countValue={countValue}
        calcLoading={calcLoading}
        calcError={calcError}
        feedbackCorrect={feedbackCorrect}
        comment={comment}
        saving={saving}
        saveError={saveError}
        onFeedbackCorrectChange={setFeedbackCorrect}
        onCommentChange={setComment}
        onRecalculate={handleRecalculate}
        onSave={handleSaveFeedback}
      />

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
