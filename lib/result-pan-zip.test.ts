import { describe, expect, it } from "vitest";

import type { GuaYaoRow } from "@/components/result/gua-module";

import { zipPanYaoRows } from "./result-pan-zip";

function mockRow(id: number): GuaYaoRow {
  return {
    liuqin: `lq${id}`,
    dizhi: "子",
    gan: "甲",
    yang: true,
    shiYing: "",
    yaoPos: id
  };
}

function mockMoving(id: number) {
  return {
    isMoving: id === 1,
    benguaIsYang: true,
    showArrow: true
  };
}

describe("zipPanYaoRows", () => {
  const base = () => ({
    liushouLabels: ["a", "b", "c", "d", "e", "f"],
    benLines: Array.from({ length: 6 }, (_, i) => mockRow(i + 1)),
    movingRows: Array.from({ length: 6 }, (_, i) => mockMoving(i))
  });

  it("throws when liushouLabels length is not 6", () => {
    expect(() =>
      zipPanYaoRows({
        ...base(),
        liushouLabels: ["x"]
      } as never)
    ).toThrow(/liushouLabels/);
  });

  it("throws when benLines length is not 6", () => {
    expect(() =>
      zipPanYaoRows({
        ...base(),
        benLines: []
      } as never)
    ).toThrow(/benLines/);
  });

  it("throws when movingRows length is not 6", () => {
    expect(() =>
      zipPanYaoRows({
        ...base(),
        movingRows: []
      } as never)
    ).toThrow(/movingRows/);
  });

  it("throws when hasBian but bianLines is missing", () => {
    expect(() =>
      zipPanYaoRows({
        ...base(),
        hasBian: true,
        bianLines: undefined
      })
    ).toThrow(/bianLines is required/);
  });

  it("throws when hasBian but bianLines length is not 6", () => {
    expect(() =>
      zipPanYaoRows({
        ...base(),
        hasBian: true,
        bianLines: [mockRow(10)]
      } as never)
    ).toThrow(/bianLines/);
  });

  it("returns 6 rows without bian when hasBian is false", () => {
    const rows = zipPanYaoRows({
      ...base(),
      hasBian: false,
      bianLines: undefined
    });
    expect(rows).toHaveLength(6);
    expect(rows[0]!.ben.yaoPos).toBe(1);
    expect(rows[0]!.bian).toBeUndefined();
    expect(rows[5]!.liushou).toBe("f");
  });

  it("returns 6 rows with bian when hasBian is true", () => {
    const bianLines = Array.from({ length: 6 }, (_, i) => ({
      ...mockRow(i + 10),
      yang: false
    }));
    const rows = zipPanYaoRows({
      ...base(),
      hasBian: true,
      bianLines
    });
    expect(rows[0]!.bian?.yaoPos).toBe(10);
    expect(rows[5]!.bian?.yaoPos).toBe(15);
  });
});
