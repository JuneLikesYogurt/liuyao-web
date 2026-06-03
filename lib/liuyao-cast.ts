import type { LiuYaoLine } from "@/components/liuyao";

export type CastLineSlot = LiuYaoLine | undefined;

/** 四象选项：值与展示名，与后端 result 串 0–3 一致 */
export const LINE_OPTIONS: ReadonlyArray<{
  value: LiuYaoLine;
  label: string;
}> = [
  { value: 0, label: "太阴" },
  { value: 1, label: "少阳" },
  { value: 2, label: "少阴" },
  { value: 3, label: "太阳" }
] as const;

/** 卦象与手动行自上而下：lines[0]=上爻 … lines[5]=初爻 */
export const DISPLAY_ROW_INDICES = [0, 1, 2, 3, 4, 5] as const;

/** lines[5]=初爻，lines[0]=上爻；第 k 次摇卦（k=1..6）写入的下标 */
export function lineIndexForShake(k: number): number {
  return 6 - k;
}

export function emptyLines(): CastLineSlot[] {
  return Array.from({ length: 6 }, () => undefined);
}

export function generateOneLine(): LiuYaoLine {
  return Math.floor(Math.random() * 4) as LiuYaoLine;
}

export function isLinesComplete(lines: CastLineSlot[]): boolean {
  return lines.length === 6 && lines.every((l) => l !== undefined);
}

export function countFilledLines(lines: CastLineSlot[]): number {
  return lines.filter((l) => l !== undefined).length;
}

export function hasAnyLine(lines: CastLineSlot[]): boolean {
  return lines.some((l) => l !== undefined);
}

/** 初爻在前、上爻在后，供 cast API */
export function linesToResultString(lines: CastLineSlot[]): string | null {
  if (!isLinesComplete(lines)) return null;
  return [...lines].reverse().map((v) => String(v)).join("");
}
