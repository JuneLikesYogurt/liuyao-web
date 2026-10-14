import { Fragment, type KeyboardEvent } from "react";

import { YaoLine, type GuaYaoRow } from "@/components/result/gua-module";
import { MovingChangeIndicator } from "@/components/result/moving-column";
import { zipPanYaoRows, type PanMovingRow } from "@/lib/result-pan-zip";
import { cn } from "@/lib/utils";

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

function onYaoKeyDown(event: KeyboardEvent, onActivate?: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate?.();
  }
}

function PanYaoCells({
  row,
  interactive,
  selected,
  onActivate,
  rowMain
}: {
  row: GuaYaoRow;
  interactive?: boolean;
  selected?: boolean;
  onActivate?: () => void;
  rowMain: number;
}) {
  const fushen = row.fushen?.trim() ?? "";
  return (
    <div
      className={cn(
        "real-pan-yao",
        interactive && "real-pan-yao--hit",
        selected && "is-selected"
      )}
      style={{ gridRow: `${rowMain} / span 2` }}
      {...(interactive
        ? {
            role: "button" as const,
            tabIndex: 0,
            onClick: onActivate,
            onKeyDown: (event: KeyboardEvent) => onYaoKeyDown(event, onActivate)
          }
        : {})}
    >
      <span className="real-pan-yao__qin">{row.liuqin}</span>
      <span className="real-pan-yao__zhi">{row.dizhi}</span>
      <span className="real-pan-yao__gan">{row.gan}</span>
      <span className="real-pan-yao__line">
        <YaoLine yang={row.yang} />
      </span>
      <span className="real-pan-yao__shi">{row.shiYing}</span>
      <span className={cn("real-pan-yao__fu", fushen && "has-text")}>{fushen}</span>
    </div>
  );
}

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

  return (
    <div className={cn("real-pan-layout", hasBian && "has-bian")}>
      <div className="real-pan-gua real-pan-gua--ben">
        <div className="real-pan-gua__name">{benName}</div>
        {rows.map((row, index) => {
          const rowMain = index * 2 + 2;
          return (
            <Fragment key={`ben-${row.ben.yaoPos ?? index}`}>
              <div className="real-pan-side real-pan-side--beast" style={{ gridRow: rowMain }}>
                {row.liushou}
              </div>
              <PanYaoCells
                row={row.ben}
                interactive={row.ben.yaoPos != null}
                selected={row.ben.yaoPos != null && selectedYao === row.ben.yaoPos}
                onActivate={
                  row.ben.yaoPos != null
                    ? () => onBenYaoClick(row.ben.yaoPos!)
                    : undefined
                }
                rowMain={rowMain}
              />
              <div className="real-pan-side real-pan-side--moving" style={{ gridRow: rowMain }}>
                <MovingChangeIndicator
                  isMoving={row.moving.isMoving}
                  benguaIsYang={row.moving.benguaIsYang}
                  showArrow={row.moving.showArrow}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
      {hasBian ? (
        <div className="real-pan-gua real-pan-gua--bian">
          <div className="real-pan-gua__name">{bianName}</div>
          {rows.map((row, index) => (
            <PanYaoCells
              key={`bian-${row.bian?.yaoPos ?? index}`}
              row={row.bian!}
              rowMain={index * 2 + 2}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
