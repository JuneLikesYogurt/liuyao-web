"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  fetchCountYongshenGrid,
  type CountYongshenGridResult
} from "@/lib/api";
import {
  DIZHI_12,
  dizhiIndex,
  sliceMonthRow,
  zhiGridIndex
} from "@/lib/dizhi";
import { cn } from "@/lib/utils";

const Y_MIN = -1;
const Y_MAX = 1;
const Y_TICKS = [-1, -0.5, 0, 0.5, 1] as const;
const SVG_W = 520;
const SVG_H = 176;
const PAD = { l: 42, r: 14, t: 22, b: 44 };

/** 近零加密的发散色停点（负蓝灰、零浅灰、正橙）。v 为真实计数，着色前再做 sqrt。 */
const HEAT_STOPS: { v: number; rgb: [number, number, number] }[] = [
  { v: -1, rgb: [36, 73, 128] },
  { v: -0.5, rgb: [70, 120, 168] },
  { v: -0.2, rgb: [130, 170, 196] },
  { v: -0.05, rgb: [190, 210, 220] },
  { v: 0, rgb: [232, 228, 220] },
  { v: 0.05, rgb: [240, 210, 175] },
  { v: 0.2, rgb: [232, 160, 90] },
  { v: 0.5, rgb: [214, 110, 45] },
  { v: 1, rgb: [180, 60, 20] }
];

const HEAT_GRID_COLS = "1.75rem repeat(12, minmax(2.25rem, 1fr))";
const HEAT_MIN_WIDTH = "32rem";

function clampY(v: number): number {
  return Math.max(Y_MIN, Math.min(Y_MAX, v));
}

function layoutPoints(values: number[]) {
  const innerW = SVG_W - PAD.l - PAD.r;
  const innerH = SVG_H - PAD.t - PAD.b;
  const span = Y_MAX - Y_MIN;
  return values.map((v, i) => ({
    x: PAD.l + (innerW * i) / 11,
    y: PAD.t + innerH * (1 - (clampY(v) - Y_MIN) / span),
    v,
    zhi: DIZHI_12[i] ?? ""
  }));
}

function yTickY(tick: number): number {
  const innerH = SVG_H - PAD.t - PAD.b;
  return PAD.t + innerH * (1 - (tick - Y_MIN) / (Y_MAX - Y_MIN));
}

function heatT(v: number): number {
  const c = clampY(v);
  return Math.sign(c) * Math.sqrt(Math.abs(c));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function heatRgb(v: number): [number, number, number] {
  const t = heatT(v);
  const stops = HEAT_STOPS.map((s) => ({ t: heatT(s.v), rgb: s.rgb }));
  if (t <= stops[0].t) return stops[0].rgb;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].t) {
      const span = stops[i].t - stops[i - 1].t;
      const u = span === 0 ? 0 : (t - stops[i - 1].t) / span;
      const a = stops[i - 1].rgb;
      const b = stops[i].rgb;
      return [
        lerp(a[0], b[0], u),
        lerp(a[1], b[1], u),
        lerp(a[2], b[2], u)
      ];
    }
  }
  return stops[stops.length - 1].rgb;
}

function heatColor(v: number): string {
  const [r, g, b] = heatRgb(v);
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

function heatTextClass(v: number): string {
  const [r, g, b] = heatRgb(v);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 160 ? "text-neutral-900" : "text-white";
}

function heatLegendGradient(): string {
  const n = 48;
  const parts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const v = -1 + (2 * i) / n;
    parts.push(`${heatColor(v)} ${(i / n) * 100}%`);
  }
  return `linear-gradient(to right, ${parts.join(", ")})`;
}

function formatCount(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return String(Number(v.toFixed(4)));
}

function LinePointTip({
  x,
  y,
  label
}: {
  x: number;
  y: number;
  label: string;
}) {
  const padX = 6;
  const h = 18;
  const w = Math.max(52, label.length * 6.4 + padX * 2);
  const above = y - 10 - h;
  const ty = above < 4 ? y + 10 : above;
  const tx = Math.max(2, Math.min(SVG_W - w - 2, x - w / 2));
  return (
    <g pointerEvents="none">
      <rect
        x={tx}
        y={ty}
        width={w}
        height={h}
        rx={3}
        className="fill-foreground"
      />
      <text
        x={tx + w / 2}
        y={ty + 13}
        textAnchor="middle"
        className="fill-background"
        fontSize="10"
      >
        {label}
      </text>
    </g>
  );
}

function YongshenZhiHeatmap({
  values,
  currentMonthIndex,
  currentDayIndex,
  selectedMonthIndex,
  selectedDayIndex,
  onSelect,
  onSelectMonth
}: {
  values: number[];
  currentMonthIndex: number;
  currentDayIndex: number;
  selectedMonthIndex: number;
  selectedDayIndex: number;
  onSelect: (monthIndex: number, dayIndex: number) => void;
  onSelectMonth: (monthIndex: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-2" style={{ minWidth: HEAT_MIN_WIDTH }}>
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: HEAT_GRID_COLS }}
        >
          <div aria-hidden className="h-6" />
          {DIZHI_12.map((zhi) => (
            <div
              key={`col-${zhi}`}
              className="h-6 text-center text-[10px] leading-6 text-muted-foreground"
            >
              {zhi}
            </div>
          ))}
          {DIZHI_12.map((monthZhi, mi) => (
            <HeatmapRow
              key={monthZhi}
              monthZhi={monthZhi}
              monthIndex={mi}
              values={values}
              currentMonthIndex={currentMonthIndex}
              currentDayIndex={currentDayIndex}
              selectedMonthIndex={selectedMonthIndex}
              selectedDayIndex={selectedDayIndex}
              onSelect={onSelect}
              onSelectMonth={onSelectMonth}
            />
          ))}
        </div>
        <HeatColorLegend />
      </div>
    </div>
  );
}

function HeatColorLegend() {
  const ticks = Y_TICKS;
  return (
    <div
      className="grid items-center gap-x-2 gap-y-1"
      style={{ gridTemplateColumns: HEAT_GRID_COLS }}
    >
      <div aria-hidden />
      <div className="col-span-12 grid gap-1">
        <div
          className="h-2 rounded-sm"
          style={{ background: heatLegendGradient() }}
          role="img"
          aria-label="计数色阶，负一到一"
        />
        <div className="relative h-4">
          {ticks.map((tick) => {
            const left = ((tick - Y_MIN) / (Y_MAX - Y_MIN)) * 100;
            const align =
              tick === Y_MIN
                ? "translate-x-0"
                : tick === Y_MAX
                  ? "-translate-x-full"
                  : "-translate-x-1/2";
            return (
              <span
                key={tick}
                className={cn(
                  "absolute top-0 text-[10px] tabular-nums text-muted-foreground",
                  align
                )}
                style={{ left: `${left}%` }}
              >
                {tick}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeatmapRow({
  monthZhi,
  monthIndex,
  values,
  currentMonthIndex,
  currentDayIndex,
  selectedMonthIndex,
  selectedDayIndex,
  onSelect,
  onSelectMonth
}: {
  monthZhi: string;
  monthIndex: number;
  values: number[];
  currentMonthIndex: number;
  currentDayIndex: number;
  selectedMonthIndex: number;
  selectedDayIndex: number;
  onSelect: (monthIndex: number, dayIndex: number) => void;
  onSelectMonth: (monthIndex: number) => void;
}) {
  const isLineMonth = monthIndex === selectedMonthIndex;
  return (
    <>
      <button
        type="button"
        aria-pressed={isLineMonth}
        aria-label={`查看月支${monthZhi}折线`}
        onClick={() => onSelectMonth(monthIndex)}
        className={cn(
          "text-center text-[10px] leading-8 text-muted-foreground",
          isLineMonth && "font-medium text-foreground"
        )}
      >
        {monthZhi}
      </button>
      {DIZHI_12.map((dayZhi, di) => {
        const v = values[zhiGridIndex(monthIndex, di)] ?? 0;
        const isCurrent =
          monthIndex === currentMonthIndex && di === currentDayIndex;
        const isSelected =
          monthIndex === selectedMonthIndex && di === selectedDayIndex;
        const showNumber = isCurrent || isSelected;
        return (
          <button
            key={`${monthZhi}-${dayZhi}`}
            type="button"
            aria-label={`月支${monthZhi}、日支${dayZhi}、计数 ${v}${isCurrent ? "，本卦" : ""}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(monthIndex, di)}
            className={cn(
              "flex h-8 min-w-[2.25rem] items-center justify-center rounded-sm border px-0.5",
              isCurrent
                ? "border-primary ring-1 ring-primary"
                : "border-transparent",
              isSelected && !isCurrent && "ring-1 ring-foreground/40"
            )}
            style={{ backgroundColor: heatColor(v) }}
            title={`${monthZhi}×${dayZhi} ${v}`}
          >
            {showNumber ? (
              <span
                className={cn(
                  "tabular-nums text-[9px] leading-none",
                  heatTextClass(v)
                )}
              >
                {formatCount(v)}
              </span>
            ) : (
              <span className="sr-only">{formatCount(v)}</span>
            )}
          </button>
        );
      })}
    </>
  );
}

export function YongshenDayZhiTrend({
  liuyaoId,
  month,
  day,
  xunkong,
  outcomeYao,
  countValue,
  calcLoading
}: {
  liuyaoId: string;
  month?: string | null;
  day?: string | null;
  xunkong?: string | null;
  outcomeYao: number | null;
  countValue: number | null;
  calcLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [payload, setPayload] = useState<CountYongshenGridResult | null>(null);
  const [payloadKey, setPayloadKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const fetchedKeyRef = useRef<string | null>(null);

  const requestKey =
    outcomeYao != null && countValue != null
      ? `${liuyaoId}:${outcomeYao}:${countValue}:${month ?? ""}:${day ?? ""}`
      : null;

  useEffect(() => {
    if (!open || requestKey == null || calcLoading || outcomeYao == null) {
      return;
    }
    if (fetchedKeyRef.current === requestKey) {
      return;
    }

    const yao = outcomeYao;

    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchCountYongshenGrid({
      liuyaoId,
      yongshen: yao
    })
      .then((result) => {
        if (cancelled) return;
        fetchedKeyRef.current = requestKey;
        setPayload(result);
        setPayloadKey(requestKey);
        const mi = dizhiIndex(result.month_zhi);
        const di = dizhiIndex(result.current_day_zhi);
        setSelectedMonthIndex(mi >= 0 ? mi : 0);
        setSelectedDayIndex(di >= 0 ? di : 0);
      })
      .catch((e) => {
        if (cancelled) return;
        fetchedKeyRef.current = null;
        setPayload(null);
        setPayloadKey(null);
        setError(e instanceof Error ? e.message : "加载趋势失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    open,
    requestKey,
    calcLoading,
    outcomeYao,
    countValue,
    liuyaoId,
    month,
    day,
    xunkong
  ]);

  const currentMonthIndex = payload ? dizhiIndex(payload.month_zhi) : -1;
  const currentDayIndex = payload ? dizhiIndex(payload.current_day_zhi) : -1;
  const lineValues = useMemo(
    () =>
      payload && selectedMonthIndex >= 0
        ? sliceMonthRow(payload.values, selectedMonthIndex)
        : [],
    [payload, selectedMonthIndex]
  );
  const points = useMemo(() => layoutPoints(lineValues), [lineValues]);
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const matchingPayload = payload != null && payloadKey === requestKey;
  const selectedValue =
    payload && matchingPayload
      ? payload.values[zhiGridIndex(selectedMonthIndex, selectedDayIndex)]
      : undefined;
  const selectedMonthZhi = DIZHI_12[selectedMonthIndex] ?? "—";
  const selectedDayZhi = DIZHI_12[selectedDayIndex] ?? "—";
  const viewingBenGuaMonth = selectedMonthIndex === currentMonthIndex;
  const hoveredPoint =
    hoveredDayIndex != null ? points[hoveredDayIndex] : undefined;

  useEffect(() => {
    setHoveredDayIndex(null);
  }, [selectedMonthIndex]);

  const showPrompt =
    outcomeYao == null || (countValue == null && !calcLoading);
  const showLoading =
    !showPrompt && (calcLoading || loading) && !matchingPayload;
  const showChart =
    !showPrompt && matchingPayload && points.length === 12;

  const innerW = SVG_W - PAD.l - PAD.r;

  return (
    <Card className="border-dashed shadow-none">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-foreground">
          月日地支趋势
        </span>
        <span
          aria-hidden
          className={cn(
            "inline-block text-[10px] text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        >
          ▶
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t px-4 pb-4 pt-3">
          {showPrompt ? (
            <p className="text-xs text-muted-foreground">
              请先点选用神并完成计算
            </p>
          ) : showLoading ? (
            <p className="text-xs text-muted-foreground">加载中…</p>
          ) : error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : showChart ? (
            <>
              <p className="text-[11px] text-muted-foreground">
                试算 · 旬空用本卦原值 · 折线随所选月支切换
              </p>
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  className="h-[11rem] w-full min-w-[32rem]"
                  role="img"
                  aria-label={`${selectedMonthZhi}月十二日支用神计数折线`}
                >
                  <text
                    x={PAD.l}
                    y={12}
                    className="fill-muted-foreground"
                    fontSize="10"
                  >
                    {selectedMonthZhi}/y
                  </text>
                  {Y_TICKS.map((tick) => {
                    const y = yTickY(tick);
                    return (
                      <g key={tick}>
                        <line
                          x1={PAD.l}
                          x2={PAD.l + innerW}
                          y1={y}
                          y2={y}
                          className={
                            tick === 0
                              ? "stroke-border"
                              : "stroke-border/60"
                          }
                          strokeDasharray={tick === 0 ? undefined : "3 3"}
                        />
                        <text
                          x={PAD.l - 6}
                          y={y + 3}
                          textAnchor="end"
                          className="fill-muted-foreground"
                          fontSize="9"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}
                  <line
                    x1={PAD.l}
                    x2={PAD.l}
                    y1={PAD.t}
                    y2={PAD.t + (SVG_H - PAD.t - PAD.b)}
                    className="stroke-border"
                  />
                  <polyline
                    points={polyline}
                    className="fill-none stroke-primary"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {points.map((p, i) => {
                    const isBenGuaDay =
                      viewingBenGuaMonth && i === currentDayIndex;
                    const isSelected = i === selectedDayIndex;
                    return (
                      <g key={p.zhi}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={14}
                          tabIndex={0}
                          role="button"
                          aria-label={`${p.zhi} ${p.v}${isBenGuaDay ? "，本卦日支" : ""}`}
                          aria-pressed={isSelected}
                          className="cursor-pointer fill-transparent"
                          onClick={() => setSelectedDayIndex(i)}
                          onMouseEnter={() => setHoveredDayIndex(i)}
                          onMouseLeave={() => setHoveredDayIndex(null)}
                          onFocus={() => setHoveredDayIndex(i)}
                          onBlur={() => setHoveredDayIndex(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedDayIndex(i);
                            }
                          }}
                        />
                        {isBenGuaDay && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={7}
                            className="fill-none stroke-primary"
                            strokeWidth="2"
                            pointerEvents="none"
                          />
                        )}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? 5 : 3.5}
                          className={
                            isSelected
                              ? "fill-primary"
                              : "fill-muted-foreground"
                          }
                          pointerEvents="none"
                        />
                        <text
                          x={p.x}
                          y={SVG_H - 22}
                          textAnchor="middle"
                          className={
                            isBenGuaDay
                              ? "fill-foreground"
                              : "fill-muted-foreground"
                          }
                          fontSize="11"
                        >
                          {p.zhi}
                        </text>
                      </g>
                    );
                  })}
                  {hoveredPoint && (
                    <LinePointTip
                      x={hoveredPoint.x}
                      y={hoveredPoint.y}
                      label={`${hoveredPoint.zhi} ${formatCount(hoveredPoint.v)}`}
                    />
                  )}
                  <text
                    x={PAD.l + innerW / 2}
                    y={SVG_H - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="10"
                  >
                    日支/x
                  </text>
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">
                月建{selectedMonthZhi} · 日支{selectedDayZhi} ·{" "}
                <span className="tabular-nums text-foreground">
                  {selectedValue == null ? "—" : formatCount(selectedValue)}
                </span>
              </p>
              <button
                type="button"
                aria-expanded={gridOpen}
                onClick={() => setGridOpen((v) => !v)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-2 text-left text-xs text-muted-foreground"
              >
                <span>展开全盘</span>
                <span
                  aria-hidden
                  className={cn(
                    "inline-block text-[10px] transition-transform",
                    gridOpen && "rotate-90"
                  )}
                >
                  ▶
                </span>
              </button>
              {gridOpen && payload && (
                <YongshenZhiHeatmap
                  values={payload.values}
                  currentMonthIndex={currentMonthIndex}
                  currentDayIndex={currentDayIndex}
                  selectedMonthIndex={selectedMonthIndex}
                  selectedDayIndex={selectedDayIndex}
                  onSelect={(mi, di) => {
                    setSelectedMonthIndex(mi);
                    setSelectedDayIndex(di);
                  }}
                  onSelectMonth={(mi) => setSelectedMonthIndex(mi)}
                />
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">加载中…</p>
          )}
        </div>
      )}
    </Card>
  );
}
