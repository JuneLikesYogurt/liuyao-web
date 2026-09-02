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
/** 0–0.5 区内的五等分刻度（不含端点 0 / 0.5）。 */
const Y_MINOR = [0.1, 0.2, 0.3, 0.4] as const;
/** 半轴上 0–0.5 所占比例，余下给 0.5–1。 */
const Y_INNER_SHARE = 0.72;
const SVG_W = 588;
const SVG_H = 196;
const PAD = { l: 44, r: 84, t: 26, b: 44 };
/** 横轴伸出最后一个日支点的长度，避免亥与箭头重叠 */
const AXIS_OVERHANG = 28;
const AXIS_ARROW_ID = "yongshen-trend-axis-arrow";

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

const HEAT_GRID_COLS = "2.25rem repeat(12, minmax(2.25rem, 1fr))";
const HEAT_MIN_WIDTH = "36rem";

function clampY(v: number): number {
  return Math.max(Y_MIN, Math.min(Y_MAX, v));
}

/** 把计数映到 [-1, 1] 轴单位：0–0.5 拉长，0.5–1 压短。 */
function yUnit(v: number): number {
  const c = clampY(v);
  const a = Math.abs(c);
  const s = c < 0 ? -1 : 1;
  if (a <= 0.5) return s * (a / 0.5) * Y_INNER_SHARE;
  return s * (Y_INNER_SHARE + ((a - 0.5) / 0.5) * (1 - Y_INNER_SHARE));
}

function valueToY(v: number): number {
  const innerH = SVG_H - PAD.t - PAD.b;
  return PAD.t + innerH * (1 - (yUnit(v) + 1) / 2);
}

function layoutPoints(values: number[]) {
  const innerW = SVG_W - PAD.l - PAD.r;
  return values.map((v, i) => ({
    x: PAD.l + (innerW * i) / 11,
    y: valueToY(v),
    v,
    zhi: DIZHI_12[i] ?? ""
  }));
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
    <div className="overflow-x-auto overflow-y-clip py-0.5">
      <div
        className="grid gap-x-1.5 gap-y-1"
        style={{
          minWidth: HEAT_MIN_WIDTH,
          gridTemplateColumns: "1.25rem 1fr"
        }}
      >
        <div aria-hidden />
        <div
          className="grid"
          style={{ gridTemplateColumns: HEAT_GRID_COLS }}
        >
          <div aria-hidden />
          <div className="col-span-12 pb-0.5 text-center text-[10px] tracking-[0.45em] text-muted-foreground">
            日支
          </div>
        </div>
        <div
          className="grid"
          style={{ gridTemplateRows: "2rem 1fr" }}
        >
          <div aria-hidden />
          <div className="flex items-center justify-center">
            <span
              className="text-[10px] text-muted-foreground"
              style={{
                writingMode: "vertical-rl",
                letterSpacing: "0.45em",
                marginBottom: "-0.45em"
              }}
            >
              月支
            </span>
          </div>
        </div>
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: HEAT_GRID_COLS }}
          role="img"
          aria-label="热力图，行是月支，列是日支"
        >
          <div className="h-8" aria-hidden />
          {DIZHI_12.map((zhi, di) => (
            <div
              key={`col-${zhi}`}
              className={cn(
                "h-8 text-center text-[10px] leading-8 text-muted-foreground",
                di === selectedDayIndex && "font-medium text-foreground"
              )}
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
        <div aria-hidden />
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
        <div className="relative h-5">
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
                  "absolute top-0 text-[10px] leading-none tabular-nums text-muted-foreground",
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
  const axisEndX = PAD.l + innerW + AXIS_OVERHANG;
  const y0 = valueToY(0);
  const plotBottom = PAD.t + (SVG_H - PAD.t - PAD.b);

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
                旬空用本卦原值 · 折线随所选月支切换
              </p>
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  className="h-[12.5rem] w-full min-w-[34rem]"
                  role="img"
                  aria-label={`${selectedMonthZhi}月十二日支用神计数折线`}
                >
                  <defs>
                    <marker
                      id={AXIS_ARROW_ID}
                      viewBox="0 0 10 10"
                      markerWidth="9"
                      markerHeight="9"
                      refX="9"
                      refY="5"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 0 0 L 10 5 L 0 10 z"
                        fill="hsl(var(--muted-foreground))"
                      />
                    </marker>
                  </defs>
                  {Y_TICKS.map((tick) => {
                    const y = valueToY(tick);
                    return (
                      <g key={tick}>
                        {tick !== 0 && tick !== Y_MIN && tick !== Y_MAX && (
                          <line
                            x1={PAD.l}
                            x2={PAD.l + innerW}
                            y1={y}
                            y2={y}
                            className="stroke-border/60"
                            strokeDasharray="3 3"
                          />
                        )}
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
                  {Y_MINOR.flatMap((step) => [step, -step]).map((tick) => {
                    const y = valueToY(tick);
                    return (
                      <line
                        key={tick}
                        x1={PAD.l}
                        x2={PAD.l + innerW}
                        y1={y}
                        y2={y}
                        className="stroke-muted-foreground/40"
                        strokeDasharray="3 3"
                      />
                    );
                  })}
                  <line
                    x1={PAD.l}
                    x2={PAD.l}
                    y1={plotBottom}
                    y2={PAD.t}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="1.25"
                    markerEnd={`url(#${AXIS_ARROW_ID})`}
                  />
                  <line
                    x1={PAD.l}
                    x2={axisEndX}
                    y1={y0}
                    y2={y0}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="1.25"
                    markerEnd={`url(#${AXIS_ARROW_ID})`}
                  />
                  <text
                    x={PAD.l}
                    y={PAD.t - 10}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="10"
                  >
                    {selectedMonthZhi}/y
                  </text>
                  <text
                    x={axisEndX + 8}
                    y={y0 + 3}
                    className="fill-muted-foreground"
                    fontSize="10"
                  >
                    日支/x
                  </text>
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
                          className="cursor-pointer fill-transparent outline-none"
                          onClick={() => {
                            setSelectedDayIndex(i);
                            setHoveredDayIndex(null);
                          }}
                          onMouseEnter={() => setHoveredDayIndex(i)}
                          onMouseLeave={() => setHoveredDayIndex(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedDayIndex(i);
                            }
                          }}
                        />
                        {isBenGuaDay ? (
                          <rect
                            x={p.x - 4}
                            y={p.y - 4}
                            width={8}
                            height={8}
                            className="fill-primary"
                            pointerEvents="none"
                          />
                        ) : (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={3.5}
                            className={
                              isSelected
                                ? "fill-primary"
                                : "fill-muted-foreground"
                            }
                            pointerEvents="none"
                          />
                        )}
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
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">
                月建【{selectedMonthZhi}】• 日支【{selectedDayZhi}】: {" "}
                <span className="tabular-nums text-foreground">
                  {selectedValue == null ? "—" : selectedValue}
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
