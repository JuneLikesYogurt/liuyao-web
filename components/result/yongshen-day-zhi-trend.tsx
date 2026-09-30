"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

import { useYongshenTrendSelection } from "@/components/result/yongshen-trend-context";
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

const Y_MIN = -1;
const Y_MAX = 1;
const Y_TICKS = [-1, -0.5, 0, 0.5, 1] as const;
/** 半轴上 0–0.5 所占比例，让靠近零的分数还能拉开。 */
const Y_INNER_SHARE = 0.72;
const SVG_W = 588;
const SVG_H = 196;
const PAD = { l: 44, r: 28, t: 16, b: 28 };
const BELOW_ZERO_CLIP = "yongshen-trend-below-zero";

type ScrollEdges = { left: boolean; right: boolean };

function clampY(v: number): number {
  return Math.max(Y_MIN, Math.min(Y_MAX, v));
}

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

/** 用已有色阶类，近零再开方，避免 144 格都贴在零色上。 */
function heatClass(v: number): string {
  const c = clampY(v);
  const t = Math.sign(c) * Math.sqrt(Math.abs(c));
  if (t <= -0.75) return "heat-n3";
  if (t <= -0.5) return "heat-n2";
  if (t <= -0.18) return "heat-n1";
  if (t < 0.18) return "heat-0";
  if (t < 0.5) return "heat-p1";
  if (t < 0.75) return "heat-p2";
  return "heat-p3";
}

function formatCount(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return String(Number(v.toFixed(4)));
}

function TrendScroll({
  children,
  watch,
  active,
  onEdges
}: {
  children: ReactNode;
  watch: string;
  active: boolean;
  onEdges: (edges: ScrollEdges) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState({ left: 0, width: 100, overflow: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      const overflow = max > 2;
      setMark({
        left: overflow ? (el.scrollLeft / el.scrollWidth) * 100 : 0,
        width: overflow ? (el.clientWidth / el.scrollWidth) * 100 : 100,
        overflow
      });
      if (active) {
        onEdges({
          left: overflow && el.scrollLeft > 2,
          right: overflow && el.scrollLeft < max - 2
        });
      }
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [watch, active, onEdges]);

  return (
    <>
      <div ref={ref} className="trend-scroll">
        {children}
      </div>
      {mark.overflow ? (
        <div className="trend-scroll-mark" aria-hidden="true">
          <i style={{ width: `${mark.width}%`, left: `${mark.left}%` }} />
        </div>
      ) : null}
    </>
  );
}

function Heatmap({
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
    <div
      className="heatmap"
      role="grid"
      aria-label="热力图，行是月支，列是日支"
    >
      <span />
      {DIZHI_12.map((zhi, di) => (
        <span
          key={`col-${zhi}`}
          className={
            di === selectedDayIndex ? "heat-label is-current" : "heat-label"
          }
        >
          {zhi}
        </span>
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
        className={
          isLineMonth
            ? "heat-label heat-label--row is-current"
            : "heat-label heat-label--row"
        }
        aria-pressed={isLineMonth}
        aria-label={`查看月支${monthZhi}折线`}
        onClick={() => onSelectMonth(monthIndex)}
      >
        {monthZhi}
      </button>
      {DIZHI_12.map((dayZhi, di) => {
        const v = values[zhiGridIndex(monthIndex, di)] ?? 0;
        const isBengua =
          monthIndex === currentMonthIndex && di === currentDayIndex;
        const isSelected =
          monthIndex === selectedMonthIndex && di === selectedDayIndex;
        return (
          <button
            key={`${monthZhi}-${dayZhi}`}
            type="button"
            className={[
              "trend-cell",
              heatClass(v),
              isSelected ? "is-selected" : "",
              isBengua ? "is-bengua" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={`月支${monthZhi}、日支${dayZhi}、计数 ${formatCount(v)}${isBengua ? "，本卦" : ""}`}
            aria-pressed={isSelected}
            data-bengua={isBengua ? "true" : undefined}
            data-value={String(v)}
            title={`${monthZhi}月 × ${dayZhi}日 ${formatCount(v)}`}
            onClick={() => onSelect(monthIndex, di)}
          />
        );
      })}
    </>
  );
}

function LineChart({
  values,
  monthZhi,
  selectedDayIndex,
  benguaDayIndex,
  onSelectDay
}: {
  values: number[];
  monthZhi: string;
  selectedDayIndex: number;
  benguaDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
}) {
  const points = useMemo(() => {
    const innerW = SVG_W - PAD.l - PAD.r;
    return values.map((v, i) => ({
      x: PAD.l + (innerW * i) / 11,
      y: valueToY(v),
      v,
      zhi: DIZHI_12[i] ?? ""
    }));
  }, [values]);
  const y0 = valueToY(0);
  const innerW = SVG_W - PAD.l - PAD.r;
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    points.length === 12
      ? `${points[0].x},${y0} ${polyline} ${points[11].x},${y0}`
      : "";

  return (
    <div className="chart-wrap">
      <svg
        className="line-chart"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label={`${monthZhi}月十二日支用神计数折线`}
      >
        <defs>
          <clipPath id={BELOW_ZERO_CLIP}>
            <rect x="0" y={y0} width={SVG_W} height={SVG_H - y0} />
          </clipPath>
        </defs>
        {Y_TICKS.map((tick) => {
          const y = valueToY(tick);
          if (tick === 0) return null;
          return (
            <g key={tick}>
              <line
                className="chart-grid-line"
                x1={PAD.l}
                x2={PAD.l + innerW}
                y1={y}
                y2={y}
              />
              <text x={PAD.l - 8} y={y + 3} textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}
        <text x={PAD.l - 8} y={y0 + 3} textAnchor="end" className="chart-zero-label">
          0
        </text>
        <line
          className="chart-zero"
          x1={PAD.l}
          x2={PAD.l + innerW}
          y1={y0}
          y2={y0}
        />
        {area ? (
          <polygon
            className="chart-area"
            points={area}
            clipPath={`url(#${BELOW_ZERO_CLIP})`}
          />
        ) : null}
        <polyline className="chart-path" points={polyline} />
        {points.map((p, i) => {
          const isBengua = i === benguaDayIndex;
          const isSelected = i === selectedDayIndex;
          return (
            <g key={p.zhi}>
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                tabIndex={0}
                role="button"
                aria-label={`${p.zhi} ${formatCount(p.v)}${isBengua ? "，本卦日支" : ""}`}
                aria-pressed={isSelected}
                className="chart-hit"
                onClick={() => onSelectDay(i)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectDay(i);
                  }
                }}
              />
              <circle
                className={
                  isBengua
                    ? "chart-point is-bengua"
                    : isSelected
                      ? "chart-point is-selected"
                      : "chart-point"
                }
                cx={p.x}
                cy={p.y}
                r={3.5}
                pointerEvents="none"
              />
              <text x={p.x} y={SVG_H - 8} textAnchor="middle">
                {p.zhi}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function YongshenDayZhiTrend({ liuyaoId }: { liuyaoId: string }) {
  const { selection } = useYongshenTrendSelection();
  const { yao, countValue, calcLoading } = selection;
  const [view, setView] = useState<"heat" | "chart">("heat");
  const [payload, setPayload] = useState<CountYongshenGridResult | null>(null);
  const [payloadKey, setPayloadKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [fade, setFade] = useState<ScrollEdges>({ left: false, right: false });
  const fetchedKeyRef = useRef<string | null>(null);

  const onEdges = useCallback((next: ScrollEdges) => {
    setFade((prev) =>
      prev.left === next.left && prev.right === next.right ? prev : next
    );
  }, []);

  const requestKey =
    yao != null && countValue != null ? `${liuyaoId}:${yao}:${countValue}` : null;

  useEffect(() => {
    if (requestKey == null || calcLoading || yao == null) return;
    if (fetchedKeyRef.current === requestKey) return;

    const yongshen = yao;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchCountYongshenGrid({ liuyaoId, yongshen })
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
      .catch((e: unknown) => {
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
  }, [requestKey, calcLoading, yao, liuyaoId]);

  const currentMonthIndex = payload ? dizhiIndex(payload.month_zhi) : -1;
  const currentDayIndex = payload ? dizhiIndex(payload.current_day_zhi) : -1;
  const lineValues = useMemo(
    () =>
      payload && selectedMonthIndex >= 0
        ? sliceMonthRow(payload.values, selectedMonthIndex)
        : [],
    [payload, selectedMonthIndex]
  );
  const matchingPayload = payload != null && payloadKey === requestKey;
  const selectedValue =
    payload && matchingPayload
      ? payload.values[zhiGridIndex(selectedMonthIndex, selectedDayIndex)]
      : undefined;
  const benguaValue =
    payload && matchingPayload && currentMonthIndex >= 0 && currentDayIndex >= 0
      ? payload.values[zhiGridIndex(currentMonthIndex, currentDayIndex)]
      : undefined;
  const selectedMonthZhi = DIZHI_12[selectedMonthIndex] ?? "—";
  const selectedDayZhi = DIZHI_12[selectedDayIndex] ?? "—";
  const showPrompt = yao == null || (countValue == null && !calcLoading);
  const showLoading = !showPrompt && (calcLoading || loading) && !matchingPayload;
  const showChart = !showPrompt && matchingPayload && lineValues.length === 12;

  return (
    <section className="detail-section real-trend" id="trend" data-detail-section>
      <div className="detail-section__head trend-section-head">
        <div>
          <p className="page-kicker">时势</p>
          <h2 className="section-title">日月地支趋势</h2>
        </div>
        {showChart ? (
          <div className="segmented" role="group" aria-label="趋势视图">
            <button
              className="segmented__item"
              type="button"
              aria-pressed={view === "heat"}
              onClick={() => setView("heat")}
            >
              热力图
            </button>
            <button
              className="segmented__item"
              type="button"
              aria-pressed={view === "chart"}
              onClick={() => setView("chart")}
            >
              折线图
            </button>
          </div>
        ) : null}
      </div>

      {showPrompt ? (
        <p className="trend-empty">请先点选用神并完成计算</p>
      ) : showLoading ? (
        <p className="trend-empty">加载中…</p>
      ) : error && !showChart ? (
        <p className="trend-empty trend-empty--error">{error}</p>
      ) : showChart && payload ? (
        <>
          <div className="trend-shell">
            <div
              className={[
                "trend-viewport",
                fade.left ? "is-fade-left" : "",
                fade.right ? "is-fade-right" : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={view === "chart" ? "trend-track is-chart" : "trend-track"}>
                <div className="trend-panel">
                  <TrendScroll watch="heat" active={view === "heat"} onEdges={onEdges}>
                    <Heatmap
                      values={payload.values}
                      currentMonthIndex={currentMonthIndex}
                      currentDayIndex={currentDayIndex}
                      selectedMonthIndex={selectedMonthIndex}
                      selectedDayIndex={selectedDayIndex}
                      onSelect={(mi, di) => {
                        setSelectedMonthIndex(mi);
                        setSelectedDayIndex(di);
                      }}
                      onSelectMonth={setSelectedMonthIndex}
                    />
                  </TrendScroll>
                  <div className="heat-legend">
                    <span>收敛</span>
                    <i className="legend-swatch heat-n3" />
                    <i className="legend-swatch heat-n1" />
                    <i className="legend-swatch heat-0" />
                    <i className="legend-swatch heat-p1" />
                    <i className="legend-swatch heat-p3" />
                    <span>增强</span>
                  </div>
                </div>
                <div className="trend-panel">
                  <TrendScroll
                    watch={`chart-${selectedMonthIndex}`}
                    active={view === "chart"}
                    onEdges={onEdges}
                  >
                    <LineChart
                      values={lineValues}
                      monthZhi={selectedMonthZhi}
                      selectedDayIndex={selectedDayIndex}
                      benguaDayIndex={
                        selectedMonthIndex === currentMonthIndex
                          ? currentDayIndex
                          : -1
                      }
                      onSelectDay={setSelectedDayIndex}
                    />
                  </TrendScroll>
                </div>
              </div>
            </div>
            <div className="trend-position" aria-hidden="true">
              <i className={view === "heat" ? "is-current" : undefined} />
              <i className={view === "chart" ? "is-current" : undefined} />
            </div>
          </div>
          <p className="trend-caption">
            <span>当前位置</span>
            <strong>
              月支 {selectedMonthZhi} · 日支 {selectedDayZhi}
            </strong>
            <strong data-selected-value={selectedValue ?? ""}>
              {formatCount(selectedValue)}
            </strong>
            {benguaValue != null ? (
              <em data-bengua-value={benguaValue}>
                本卦 {payload.month_zhi}月{payload.current_day_zhi}日{" "}
                {formatCount(benguaValue)}
              </em>
            ) : null}
          </p>
        </>
      ) : (
        <p className="trend-empty">加载中…</p>
      )}
    </section>
  );
}
