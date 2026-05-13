import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export type GuaYaoRow = {
  liuqin: string;
  dizhi: string;
  gan: string;
  yang: boolean;
  shiYing: "" | "世" | "应";
  /** 伏神整行文案（含「伏」）；无则不显示副行 */
  fushen?: string;
  /** 爻位 1–6（初爻=1）；本卦点选用神时使用 */
  yaoPos?: number;
};

export function YaoLine({ yang }: { yang: boolean }) {
  const base =
    "inline-block h-2 w-12 rounded-full bg-foreground transition-colors";

  if (yang) {
    return <span className={base} />;
  }

  return (
    <span className="inline-flex w-12 items-center justify-between">
      <span className={`${base} mr-0.5`} />
      <span className={`${base} ml-0.5`} />
    </span>
  );
}

export function GuaYaoRowView({
  row,
  variant,
  interactive,
  selected,
  onActivate,
  /** Grid 排盘：无伏神也保留副行高度，与六兽/动爻列对齐 */
  fushenSlotReserved = false
}: {
  row: GuaYaoRow;
  variant: "ben" | "bian";
  interactive?: boolean;
  selected?: boolean;
  onActivate?: () => void;
  fushenSlotReserved?: boolean;
}) {
  const textMuted =
    variant === "bian" ? "text-slate-800" : "text-foreground";

  const fushenText = row.fushen?.trim();
  const hasFushen = Boolean(fushenText);

  const showFushenBand = hasFushen || fushenSlotReserved;

  const mainRow = (
    <div
      className={cn(
        "flex min-h-[1.5rem] w-full min-w-0 items-center gap-3 text-xs",
        showFushenBand && "pb-px"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        <span className="truncate text-right font-medium">{row.liuqin}</span>
        <span className="truncate text-right tabular-nums">{row.dizhi}</span>
        <span className="shrink-0 text-right tabular-nums text-muted-foreground">
          {row.gan}
        </span>
      </div>
      <div className="flex shrink-0 justify-center px-0.5">
        <YaoLine yang={row.yang} />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-start">
        <span className="text-[11px] text-red-600">{row.shiYing}</span>
      </div>
    </div>
  );

  const fushenRowFilled = hasFushen ? (
    <div className="flex min-h-[1.125rem] w-full min-w-0 items-center gap-3 text-[10px] leading-tight">
      <div className="flex min-w-0 flex-1 justify-end pr-0.5">
        <span className="truncate text-right tabular-nums text-red-600">
          {fushenText}
        </span>
      </div>
      <div className="w-12 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1" aria-hidden />
    </div>
  ) : null;

  const fushenRowEmptySlot =
    fushenSlotReserved && !hasFushen ? (
      <div
        className="flex min-h-[1.125rem] w-full min-w-0 items-center gap-3 text-[10px] leading-tight"
        aria-hidden
      >
        <div className="flex min-w-0 flex-1 justify-end pr-0.5" />
        <div className="w-12 shrink-0" />
        <div className="min-w-0 flex-1" />
      </div>
    ) : null;

  const secondRow = fushenRowFilled ?? fushenRowEmptySlot;

  const body =
    showFushenBand ? (
      <div className="flex w-full min-w-0 flex-col gap-0">
        {mainRow}
        {secondRow}
      </div>
    ) : (
      mainRow
    );

  return (
    <div
      className={cn(
        "w-full min-w-0 text-xs",
        textMuted,
        interactive &&
          "cursor-pointer rounded-md border border-transparent px-1 -mx-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        interactive && selected && "border-primary bg-primary/10"
      )}
      {...(interactive
        ? {
            role: "button" as const,
            tabIndex: 0,
            onClick: onActivate,
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate?.();
              }
            }
          }
        : {})}
    >
      {body}
    </div>
  );
}

export function GuaModule({
  name,
  lines,
  variant,
  selectableBen,
  selectedYao,
  onBenYaoClick
}: {
  name: string;
  lines: GuaYaoRow[];
  variant: "ben" | "bian";
  /** 仅本卦：六爻可点选为用神 */
  selectableBen?: boolean;
  selectedYao?: number | null;
  onBenYaoClick?: (yaoPos: number) => void;
}) {
  const benInteractive = Boolean(
    selectableBen && variant === "ben" && onBenYaoClick
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex min-h-[2.5rem] items-center justify-center px-1 text-center text-sm font-medium text-foreground">
        {name}
      </div>
      <div className="flex flex-col gap-1">
        {lines.map((row, i) => (
          <GuaYaoRowView
            key={i}
            row={row}
            variant={variant}
            interactive={benInteractive && row.yaoPos != null}
            selected={
              benInteractive &&
              row.yaoPos != null &&
              selectedYao === row.yaoPos
            }
            onActivate={
              row.yaoPos != null && onBenYaoClick
                ? () => onBenYaoClick(row.yaoPos!)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
