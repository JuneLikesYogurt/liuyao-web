"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { LiuYao, type LiuYaoLine } from "@/components/liuyao";
import { Button } from "@/components/ui/button";
import {
  dateToDatetimeLocalValue,
  datetimeLocalToCastString,
  formatCastDateTime,
  isValidManualCastDatetimeLocal
} from "@/lib/cast-datetime";
import {
  countFilledLines,
  DISPLAY_ROW_INDICES,
  emptyLines,
  generateOneLine,
  hasAnyLine,
  isLinesComplete,
  LINE_OPTIONS,
  lineIndexForShake,
  linesToResultString,
  type CastLineSlot
} from "@/lib/liuyao-cast";
import { yaoWeiLabel } from "@/lib/yao-wei";
import { cn } from "@/lib/utils";

const SHAKE_ANIMATION_MS = 1200;

type CastMethod = "shake" | "manual";

type ShakePhase = "idle" | "shaking";

export interface CastSubmitPayload {
  result: string;
  date: string;
}

export interface HexagramCastPanelProps {
  onRequireAuth: () => boolean;
  onSubmit: (payload: CastSubmitPayload) => Promise<void>;
  submitting: boolean;
}

function CoinAnimation() {
  return (
    <div className="flex justify-center gap-4 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 shadow-sm"
        >
          <div
            className="h-8 w-8 rounded-full border border-amber-500/80 bg-amber-50/80"
            style={{
              animation: `spin 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

function MethodSwitch({
  method,
  disabled,
  onChange
}: {
  method: CastMethod | null;
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
  submitting
}: HexagramCastPanelProps) {
  const [castMethod, setCastMethod] = useState<CastMethod | null>(null);
  const [shakeLines, setShakeLines] = useState<CastLineSlot[]>(emptyLines);
  const [manualLines, setManualLines] = useState<CastLineSlot[]>(emptyLines);
  const [manualDatetimeLocal, setManualDatetimeLocal] = useState("");
  const [shakePhase, setShakePhase] = useState<ShakePhase>("idle");
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shakeCount = countFilledLines(shakeLines);
  const manualHasAny = hasAnyLine(manualLines);

  const displayLines = castMethod === "manual" ? manualLines : shakeLines;

  const manualDateValid = isValidManualCastDatetimeLocal(manualDatetimeLocal);

  const canSubmit = useMemo(() => {
    if (!castMethod) return false;
    if (castMethod === "shake") return isLinesComplete(shakeLines);
    return isLinesComplete(manualLines) && manualDateValid;
  }, [castMethod, manualDateValid, manualLines, shakeLines]);

  const showHexagram =
    castMethod !== null &&
    (shakePhase === "shaking" ||
      (castMethod === "manual" ? manualHasAny : shakeCount > 0));

  const hasProgress =
    shakeCount > 0 || manualHasAny || manualDatetimeLocal !== "";

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
  }, [clearShakeTimer]);

  const handleMethodChange = useCallback(
    (next: CastMethod) => {
      if (submitting || shakePhase === "shaking") return;
      if (castMethod === next) return;
      resetContent();
      setCastMethod(next);
      if (next === "manual") {
        setManualDatetimeLocal(dateToDatetimeLocalValue(new Date()));
      }
    },
    [castMethod, resetContent, shakePhase, submitting]
  );

  const handleReset = useCallback(() => {
    resetContent();
    if (castMethod === "manual") {
      setManualDatetimeLocal(dateToDatetimeLocalValue(new Date()));
    }
  }, [castMethod, resetContent]);

  const handleShake = useCallback(() => {
    if (!onRequireAuth() || castMethod !== "shake") return;
    if (submitting || shakePhase === "shaking" || shakeCount >= 6) return;

    const nextK = shakeCount + 1;
    const pendingLine = generateOneLine();
    const targetIndex = lineIndexForShake(nextK);

    setShakePhase("shaking");
    clearShakeTimer();

    shakeTimerRef.current = setTimeout(() => {
      setShakeLines((prev) => {
        const next = [...prev];
        next[targetIndex] = pendingLine;
        return next;
      });
      setShakePhase("idle");
      shakeTimerRef.current = null;
    }, SHAKE_ANIMATION_MS);
  }, [
    castMethod,
    clearShakeTimer,
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
    if (!onRequireAuth() || submitting || !canSubmit || !castMethod) return;

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
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              size="lg"
              className="min-w-[120px] rounded-full bg-amber-500 text-sm font-medium tracking-[0.25em] text-amber-50 shadow-sm hover:bg-amber-500/90"
              onClick={handleShake}
              disabled={
                submitting || shakePhase === "shaking" || shakeCount >= 6
              }
            >
              {shakeButtonLabel}
            </Button>
            {hasProgress && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 text-xs"
                onClick={handleReset}
                disabled={submitting || shakePhase === "shaking"}
              >
                重来
              </Button>
            )}
          </div>

          {shakePhase === "shaking" && <CoinAnimation />}

          {shakePhase === "shaking" && (
            <p className="text-center text-xs text-muted-foreground">
              {progressYaoPos}/6
            </p>
          )}
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
          {hasProgress && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-center text-xs text-muted-foreground"
              onClick={handleReset}
              disabled={submitting}
            >
              重来
            </Button>
          )}
        </div>
      )}

      {showHexagram && (
        <LiuYao
          lines={displayLines}
          className="border-amber-100 bg-amber-50/40"
        />
      )}

      <div className="flex justify-center pt-1">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-8 text-xs"
          onClick={handlePan}
          disabled={!canSubmit || submitting || castMethod === null}
        >
          {submitting ? "排盘中…" : "排盘"}
        </Button>
      </div>
    </section>
  );
}
