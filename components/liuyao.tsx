import * as React from "react";

import { cn } from "@/lib/utils";

export type LiuYaoLine = 0 | 1 | 2 | 3;

export interface LiuYaoProps {
  lines: Array<LiuYaoLine | undefined>;
  className?: string;
}

type ParsedLine =
  | {
      kind: "taiyin";
      yang: false;
      moving: true;
    }
  | {
      kind: "shaoyang";
      yang: true;
      moving: false;
    }
  | {
      kind: "shaoyin";
      yang: false;
      moving: false;
    }
  | {
      kind: "taiyang";
      yang: true;
      moving: true;
    };

function parseLine(v: number | undefined): ParsedLine | null {
  switch (v) {
    case 0:
      return { kind: "taiyin", yang: false, moving: true };
    case 1:
      return { kind: "shaoyang", yang: true, moving: false };
    case 2:
      return { kind: "shaoyin", yang: false, moving: false };
    case 3:
      return { kind: "taiyang", yang: true, moving: true };
    default:
      return null;
  }
}

function TaiYangMarker() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-foreground/80" />
  );
}

function TaiYinMarker() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center text-[11px] text-foreground/80">
      ×
    </span>
  );
}

export function LiuYao({ lines, className }: LiuYaoProps) {
  // lines[0]=上爻在上，lines[5]=初爻在下
  const indices = React.useMemo(() => [0, 1, 2, 3, 4, 5], []);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[320px] rounded-xl border bg-white p-4 sm:max-w-[420px]",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {indices.map((i) => {
          const parsed = parseLine(lines?.[i]);
          const isMoving = parsed?.moving ?? false;
          const isYang = parsed?.yang ?? false;

          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] items-center gap-3"
            >
              <div className="flex items-center justify-center">
                {parsed ? (
                  isYang ? (
                    <div className="h-2 w-full rounded-full bg-foreground" />
                  ) : (
                    <div className="flex w-full items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-foreground" />
                      <div className="h-2 flex-1 rounded-full bg-foreground" />
                    </div>
                  )
                ) : (
                  <div className="h-2 w-full rounded-full bg-foreground/10" />
                )}
              </div>

              <div className="flex h-6 w-6 items-center justify-center">
                {isMoving &&
                  (parsed?.kind === "taiyang" ? (
                    <TaiYangMarker />
                  ) : (
                    <TaiYinMarker />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

