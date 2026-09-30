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

/** 0 = 字（阴），1 = 背（阳） */
export type CoinFace = 0 | 1;

export type ThreeCoinFaces = [CoinFace, CoinFace, CoinFace];

/** 未摇时三枚光背朝上 */
export const RESTING_COIN_FACES: ThreeCoinFaces = [1, 1, 1];

export interface ThreeCoinToss {
  faces: ThreeCoinFaces;
  line: LiuYaoLine;
}

/**
 * 金钱卦：字为阴计 2、背为阳计 3。
 * 三枚求和 6/7/8/9 → 太阴/少阳/少阴/太阳（0–3），与后端 result 位一致。
 */
export function coinsToLine(faces: readonly CoinFace[]): LiuYaoLine {
  const sum = faces.reduce<number>((s, f) => s + (f === 0 ? 2 : 3), 0);
  return (sum - 6) as LiuYaoLine;
}

export function tossOneCoin(): CoinFace {
  return Math.random() < 0.5 ? 0 : 1;
}

export function tossThreeCoins(): ThreeCoinToss {
  const faces: ThreeCoinFaces = [
    tossOneCoin(),
    tossOneCoin(),
    tossOneCoin()
  ];
  return { faces, line: coinsToLine(faces) };
}

/** 0° = 背朝上；半圈奇数 = 字。同面也加整圈，避免「结果没变就不转」。 */
export function nextCoinRotation(
  currentDeg: number,
  target: CoinFace,
  extraFullTurns: number
): number {
  const halfTurns = Math.round(currentDeg / 180);
  const currentIsBei = halfTurns % 2 === 0;
  const targetIsBei = target === 1;
  const extraHalfTurns = extraFullTurns * 2 + (currentIsBei === targetIsBei ? 0 : 1);
  return currentDeg + extraHalfTurns * 180;
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

/** 上爻在前、初爻在后，与后端 yaoguaRes / gua_id 字符序一致 */
export function linesToResultString(lines: CastLineSlot[]): string | null {
  if (!isLinesComplete(lines)) return null;
  return lines.map((v) => String(v)).join("");
}
