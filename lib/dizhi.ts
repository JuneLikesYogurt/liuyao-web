/** 十二地支，下标 0 = 子 … 11 = 亥，与后端 `DizhiRelaService.dizhiSort` 一致。 */
export const DIZHI_12 = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥"
] as const;

export type Dizhi = (typeof DIZHI_12)[number];

export function isDizhi(value: string): value is Dizhi {
  return (DIZHI_12 as readonly string[]).includes(value);
}

export function dizhiIndex(zhi: string | null | undefined): number {
  if (!zhi) return -1;
  return (DIZHI_12 as readonly string[]).indexOf(zhi);
}

/** 144 网格下标：月支外层、日支内层。`values[0]` = 子月子日。 */
export function zhiGridIndex(monthIndex: number, dayIndex: number): number {
  return monthIndex * 12 + dayIndex;
}

/** 从 144 中切出某月支对应的 12 个日支（与折线横轴一致）。 */
export function sliceMonthRow(
  values: number[],
  monthIndex: number
): number[] {
  if (values.length !== 144 || monthIndex < 0 || monthIndex > 11) {
    return [];
  }
  return values.slice(monthIndex * 12, monthIndex * 12 + 12);
}

/**
 * 从月/日干支取地支。二字干支用第二字，与后端 `substring(1, 2)` 一致；单字则原样。
 */
export function earthlyBranchFromGanzhi(
  ganzhi: string | null | undefined
): Dizhi | null {
  if (!ganzhi) return null;
  const zhi = ganzhi.length >= 2 ? ganzhi.substring(1, 2) : ganzhi;
  return isDizhi(zhi) ? zhi : null;
}
