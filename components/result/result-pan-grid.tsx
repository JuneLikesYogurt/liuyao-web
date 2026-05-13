import { Fragment } from "react";

import { GuaYaoRowView, type GuaYaoRow } from "@/components/result/gua-module";
import { MovingChangeIndicator } from "@/components/result/moving-column";
import { zipPanYaoRows, type PanMovingRow } from "@/lib/result-pan-zip";
import { cn } from "@/lib/utils";

/** 与 `GuaYaoRowView` 主–伏列 `gap-0` 一致，伏神贴主行 */
const panLiuShouCol = "flex w-9 shrink-0 flex-col gap-0 sm:w-10";
const panMovingCol = "flex w-12 shrink-0 flex-col gap-0 sm:w-14";
/** 四列主行同高、下缘微缝，与卦爻主行 `pb-px` 对齐 */
const panLiuShouMain =
  "flex min-h-[1.5rem] w-full items-center justify-center pb-px text-xs font-medium text-amber-700";
const panMovingMain =
  "flex min-h-[1.5rem] w-full items-center justify-center pb-px";

export type ResultPanGridProps = {
  liushouLabels: string[];
  benName: string;
  benLines: GuaYaoRow[];
  hasBian: boolean;
  movingRows: PanMovingRow[];
  bianName: string;
  bianLines: GuaYaoRow[];
  selectedYao: number | null;
  onBenYaoClick: (yaoPos: number) => void;
};

/**
 * 整盘 CSS Grid：每爻一行、多列同高，满足 UI.md（避免横排 flex 做整体对齐）。
 */
export function ResultPanGrid({
  liushouLabels,
  benName,
  benLines,
  hasBian,
  movingRows,
  bianName,
  bianLines,
  selectedYao,
  onBenYaoClick
}: ResultPanGridProps) {
  const rows = zipPanYaoRows({
    liushouLabels,
    benLines,
    movingRows,
    bianLines,
    hasBian
  });

  const gridCols = hasBian
    ? "grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)]"
    : "grid-cols-[auto_minmax(0,1fr)]";

  return (
    <div
      className={cn(
        "grid w-full min-w-[min(100%,42rem)] gap-y-px gap-x-2 sm:gap-x-3",
        gridCols
      )}
    >
      <div className="min-h-[2.5rem] w-9 shrink-0 sm:w-10" aria-hidden />
      <div className="flex min-h-[2.5rem] min-w-0 items-center justify-center px-1 text-center text-sm font-medium text-foreground">
        {benName}
      </div>
      {hasBian && (
        <>
          <div className="min-h-[2.5rem] w-12 shrink-0 sm:w-14" aria-hidden />
          <div className="flex min-h-[2.5rem] min-w-0 items-center justify-center px-1 text-center text-sm font-medium text-foreground">
            {bianName}
          </div>
        </>
      )}

      {rows.map((r, i) => (
        <Fragment key={i}>
          <div className={panLiuShouCol}>
            <div className={panLiuShouMain}>
              <span className="max-w-full truncate text-center">
                {r.liushou}
              </span>
            </div>
            <div className="min-h-[1.125rem] w-full" aria-hidden />
          </div>

          <div className="min-w-0">
            <GuaYaoRowView
              row={r.ben}
              variant="ben"
              fushenSlotReserved
              interactive={r.ben.yaoPos != null}
              selected={
                r.ben.yaoPos != null && selectedYao === r.ben.yaoPos
              }
              onActivate={
                r.ben.yaoPos != null
                  ? () => onBenYaoClick(r.ben.yaoPos!)
                  : undefined
              }
            />
          </div>

          {hasBian ? (
            <>
              <div className={panMovingCol}>
                <div className={panMovingMain}>
                  <MovingChangeIndicator
                    isMoving={r.moving.isMoving}
                    benguaIsYang={r.moving.benguaIsYang}
                    showArrow={r.moving.showArrow}
                  />
                </div>
                <div className="min-h-[1.125rem] w-full" aria-hidden />
              </div>
              <div className="min-w-0">
                <GuaYaoRowView
                  row={r.bian!}
                  variant="bian"
                  fushenSlotReserved
                />
              </div>
            </>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
