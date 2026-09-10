"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  COIN_FLIP_MAX_MS,
  CopperCoins
} from "@/components/cast/copper-coins";
import { LiuYao, type LiuYaoLine } from "@/components/liuyao";
import { Button } from "@/components/ui/button";
import {
  dateToDatetimeLocalValue,
  datetimeLocalToCastString,
  formatCastDateTime,
  isValidManualCastDatetimeLocal
} from "@/lib/cast-datetime";
import {
  RESTING_COIN_FACES,
  countFilledLines,
  DISPLAY_ROW_INDICES,
  emptyLines,
  hasAnyLine,
  isLinesComplete,
  LINE_OPTIONS,
  lineIndexForShake,
  linesToResultString,
  tossThreeCoins,
  type CastLineSlot,
  type ThreeCoinFaces
} from "@/lib/liuyao-cast";
import { yaoWeiLabel } from "@/lib/yao-wei";
import { cn } from "@/lib/utils";

type CastMethod = "shake" | "manual";

type ShakePhase = "idle" | "shaking";

export interface CastSubmitPayload {
  result: string;
  date: string;
}

export interface HexagramCastPanelProps {
  onRequireAuth: () => boolean;
  onSubmit: (payload: CastSubmitPayload) => Promise<void>;
  onActivity?: () => void;
  submitting: boolean;
}

const actionPrimaryClass =
  "h-8 min-w-[4.5rem] rounded-full px-4 text-xs font-medium text-amber-50 shadow-sm hover:bg-amber-500/90 bg-amber-500";
const actionSecondaryClass = "h-8 min-w-[4.5rem] rounded-full px-4 text-xs font-medium";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function MethodSwitch({
  method,
  disabled,
  onChange
}: {
  method: CastMethod;
  disabled: boolean;
  onChange: (m: CastMethod) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1"
      role="group"
      aria-label="起卦方式"
    >
      {(
        [
          ["shake", "摇卦"],
          ["manual", "手动录入"]
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value)}
          className={cn(
            "rounded-md py-2 text-sm font-medium transition-colors",
            method === value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function HexagramCastPanel({
  onRequireAuth,
  onSubmit,
  onActivity,
  submitting
}: HexagramCastPanelProps) {
  const [castMethod, setCastMethod] = useState<CastMethod>("shake");
  const [shakeLines, setShakeLines] = useState<CastLineSlot[]>(emptyLines);
  const [manualLines, setManualLines] = useState<CastLineSlot[]>(emptyLines);
  const [manualDatetimeLocal, setManualDatetimeLocal] = useState("");
  const [shakePhase, setShakePhase] = useState<ShakePhase>("idle");
  const [coinFaces, setCoinFaces] =
    useState<ThreeCoinFaces>(RESTING_COIN_FACES);
  const [coinSpinId, setCoinSpinId] = useState(0);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shakeCount = countFilledLines(shakeLines);
  const manualHasAny = hasAnyLine(manualLines);

  const displayLines = castMethod === "manual" ? manualLines : shakeLines;

  const manualDateValid = isValidManualCastDatetimeLocal(manualDatetimeLocal);

  const canSubmit = useMemo(() => {
    if (castMethod === "shake") return isLinesComplete(shakeLines);
    return isLinesComplete(manualLines) && manualDateValid;
  }, [castMethod, manualDateValid, manualLines, shakeLines]);

  const shakeHasProgress = shakeCount > 0;
  const manualHasProgress = manualHasAny || manualDatetimeLocal !== "";

  const clearShakeTimer = useCallback(() => {
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
  }, []);

  const resetContent = useCallback(() => {
    clearShakeTimer();
    setShakeLines(emptyLines());
    setManualLines(emptyLines());
    setManualDatetimeLocal("");
    setShakePhase("idle");
    setCoinFaces(RESTING_COIN_FACES);
    setCoinSpinId(0);
  }, [clearShakeTimer]);

  const handleMethodChange = useCallback(
    (next: CastMethod) => {
      if (submitting || shakePhase === "shaking") return;
      if (castMethod === next) return;
      onActivity?.();
      resetContent();
      setCastMethod(next);
      if (next === "manual") {
        setManualDatetimeLocal(dateToDatetimeLocalValue(new Date()));
      }
    },
    [castMethod, onActivity, resetContent, shakePhase, submitting]
  );

  const handleReset = useCallback(() => {
    onActivity?.();
    resetContent();
    if (castMethod === "manual") {
      setManualDatetimeLocal(dateToDatetimeLocalValue(new Date()));
    }
  }, [castMethod, onActivity, resetContent]);

  const handleShake = useCallback(() => {
    if (!onRequireAuth() || castMethod !== "shake") return;
    if (submitting || shakePhase === "shaking" || shakeCount >= 6) return;

    onActivity?.();

    const nextK = shakeCount + 1;
    const toss = tossThreeCoins();
    const targetIndex = lineIndexForShake(nextK);

    setCoinFaces(toss.faces);
    setCoinSpinId((id) => id + 1);
    setShakePhase("shaking");
    clearShakeTimer();

    const delayMs = prefersReducedMotion() ? 0 : COIN_FLIP_MAX_MS;
    shakeTimerRef.current = setTimeout(() => {
      setShakeLines((prev) => {
        const next = [...prev];
        next[targetIndex] = toss.line;
        return next;
      });
      setShakePhase("idle");
      shakeTimerRef.current = null;
    }, delayMs);
  }, [
    castMethod,
    clearShakeTimer,
    onActivity,
    onRequireAuth,
    shakeCount,
    shakePhase,
    submitting
  ]);

  const handleManualChange = useCallback((arrayIndex: number, value: string) => {
    const parsed: CastLineSlot =
      value === "" ? undefined : (Number(value) as LiuYaoLine);
    setManualLines((prev) => {
      const next = [...prev];
      next[arrayIndex] = parsed;
      return next;
    });
  }, []);

  const handlePan = useCallback(async () => {
    if (!onRequireAuth() || submitting || !canSubmit) return;

    const lines = castMethod === "manual" ? manualLines : shakeLines;
    const result = linesToResultString(lines);
    if (!result) return;

    const date =
      castMethod === "manual"
        ? datetimeLocalToCastString(manualDatetimeLocal)
        : formatCastDateTime(new Date());
    if (!date) return;

    await onSubmit({ result, date });
  }, [
    canSubmit,
    castMethod,
    manualDatetimeLocal,
    manualLines,
    onRequireAuth,
    onSubmit,
    shakeLines,
    submitting
  ]);

  const shakeButtonLabel =
    shakeCount === 0 ? "起卦" : shakeCount < 6 ? "继续起卦" : "起卦";

  const progressYaoPos = shakePhase === "shaking" ? shakeCount + 1 : shakeCount;

  const fieldClass =
    "w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-200";

  return (
    <section className="grid gap-4">
      <MethodSwitch
        method={castMethod}
        disabled={submitting || shakePhase === "shaking"}
        onChange={handleMethodChange}
      />

      {castMethod === "shake" && (
        <div className="grid gap-3">
          <CopperCoins faces={coinFaces} spinId={coinSpinId} />

          <p
            className="text-center text-xs tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {progressYaoPos}/6
          </p>
        </div>
      )}

      {castMethod === "manual" && (
        <div className="grid gap-2">
          <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
            <label htmlFor="cast-datetime" className="text-xs font-medium text-slate-700">
              时间
            </label>
            <input
              id="cast-datetime"
              type="datetime-local"
              value={manualDatetimeLocal}
              onChange={(e) => setManualDatetimeLocal(e.target.value)}
              disabled={submitting}
              className={fieldClass}
            />
          </div>
          {DISPLAY_ROW_INDICES.map((idx) => {
            const yaoPos = 6 - idx;
            return (
              <div
                key={idx}
                className="grid grid-cols-[4.5rem_1fr] items-center gap-2"
              >
                <span className="text-xs font-medium text-slate-700">
                  {yaoWeiLabel(yaoPos)}
                </span>
                <select
                  value={
                    manualLines[idx] === undefined
                      ? ""
                      : String(manualLines[idx])
                  }
                  onChange={(e) => handleManualChange(idx, e.target.value)}
                  disabled={submitting}
                  className={fieldClass}
                >
                  <option value="">—</option>
                  {LINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      <LiuYao
        lines={displayLines}
        className="border-amber-100 bg-amber-50/40"
      />

      {castMethod === "shake" && (
        <div className="grid grid-cols-3 justify-self-center gap-2">
          <Button
            size="sm"
            className={actionPrimaryClass}
            onClick={handleShake}
            disabled={
              submitting || shakePhase === "shaking" || shakeCount >= 6
            }
          >
            {shakeButtonLabel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={actionSecondaryClass}
            onClick={handleReset}
            disabled={
              submitting || shakePhase === "shaking" || !shakeHasProgress
            }
          >
            重来
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={actionSecondaryClass}
            onClick={handlePan}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "排盘中…" : "排盘"}
          </Button>
        </div>
      )}

      {castMethod === "manual" && (
        <div className="grid grid-cols-2 justify-self-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={actionSecondaryClass}
            onClick={handleReset}
            disabled={submitting || !manualHasProgress}
          >
            重来
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={actionSecondaryClass}
            onClick={handlePan}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "排盘中…" : "排盘"}
          </Button>
        </div>
      )}
    </section>
  );
}
