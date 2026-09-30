import { describe, expect, it } from "vitest";

import {
  DIZHI_12,
  dizhiIndex,
  earthlyBranchFromGanzhi,
  isDizhi,
  sliceMonthRow,
  zhiGridIndex
} from "./dizhi";

describe("dizhi", () => {
  it("orders twelve branches 子 through 亥", () => {
    expect(DIZHI_12).toEqual([
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
    ]);
    expect(dizhiIndex("子")).toBe(0);
    expect(dizhiIndex("亥")).toBe(11);
    expect(dizhiIndex("甲")).toBe(-1);
    expect(isDizhi("卯")).toBe(true);
    expect(isDizhi("甲")).toBe(false);
  });

  it("takes the earthly branch as Java substring(1, 2)", () => {
    expect(earthlyBranchFromGanzhi("甲子")).toBe("子");
    expect(earthlyBranchFromGanzhi("丙寅")).toBe("寅");
    expect(earthlyBranchFromGanzhi("子")).toBe("子");
    expect(earthlyBranchFromGanzhi("甲")).toBe(null);
    expect(earthlyBranchFromGanzhi("")).toBe(null);
    expect(earthlyBranchFromGanzhi(null)).toBe(null);
  });

  it("indexes 144 as month outer, day inner", () => {
    expect(zhiGridIndex(0, 0)).toBe(0);
    expect(zhiGridIndex(0, 11)).toBe(11);
    expect(zhiGridIndex(1, 0)).toBe(12);
    expect(zhiGridIndex(8, 10)).toBe(8 * 12 + 10);
    const row = Array.from({ length: 144 }, (_, i) => i);
    expect(sliceMonthRow(row, 0)).toEqual(row.slice(0, 12));
    expect(sliceMonthRow(row, 8)).toEqual(row.slice(96, 108));
    expect(sliceMonthRow(row, -1)).toEqual([]);
    expect(sliceMonthRow([1, 2], 0)).toEqual([]);
  });
});
