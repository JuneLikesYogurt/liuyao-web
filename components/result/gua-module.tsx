import { cn } from "@/lib/utils";

export type GuaYaoRow = {
  liuqin: string;
  dizhi: string;
  yang: boolean;
  shiYing: "" | "世" | "应";
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

function GuaYaoRowView({
  row,
  variant
}: {
  row: GuaYaoRow;
  variant: "ben" | "bian";
}) {
  const textMuted =
    variant === "bian" ? "text-slate-800" : "text-foreground";

  return (
    <div
      className={cn(
        "flex min-h-[1.5rem] w-full min-w-0 items-center gap-3 text-xs",
        textMuted
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        <span className="truncate text-right font-medium">{row.liuqin}</span>
        <span className="truncate text-right tabular-nums">{row.dizhi}</span>
      </div>
      <div className="flex shrink-0 justify-center px-0.5">
        <YaoLine yang={row.yang} />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-start">
        <span className="text-[11px] text-red-600">{row.shiYing}</span>
      </div>
    </div>
  );
}

export function GuaModule({
  name,
  lines,
  variant
}: {
  name: string;
  lines: GuaYaoRow[];
  variant: "ben" | "bian";
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex min-h-[2.5rem] items-center justify-center px-1 text-center text-sm font-medium text-foreground">
        {name}
      </div>
      <div className="flex flex-col gap-1">
        {lines.map((row, i) => (
          <GuaYaoRowView key={i} row={row} variant={variant} />
        ))}
      </div>
    </div>
  );
}
