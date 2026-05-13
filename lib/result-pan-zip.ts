import type { GuaYaoRow } from "@/components/result/gua-module";

/** 与 `BenGuaYongShenClient` 动爻列单行数据一致 */
export type PanMovingRow = {
  isMoving: boolean;
  benguaIsYang: boolean;
  showArrow: boolean;
};

export type PanYaoDisplayRow = {
  liushou: string;
  ben: GuaYaoRow;
  moving: PanMovingRow;
  bian?: GuaYaoRow;
};

const SIX = 6;

function assertLength(name: string, arr: unknown[], expected: number): void {
  if (arr.length !== expected) {
    throw new Error(`${name} must have length ${expected}, got ${arr.length}`);
  }
}

export function zipPanYaoRows(args: {
  liushouLabels: string[];
  benLines: GuaYaoRow[];
  movingRows: PanMovingRow[];
  bianLines: GuaYaoRow[] | undefined;
  hasBian: boolean;
}): PanYaoDisplayRow[] {
  const { liushouLabels, benLines, movingRows, bianLines, hasBian } = args;

  assertLength("liushouLabels", liushouLabels, SIX);
  assertLength("benLines", benLines, SIX);
  assertLength("movingRows", movingRows, SIX);

  if (hasBian) {
    if (!bianLines) {
      throw new Error("bianLines is required when hasBian is true");
    }
    assertLength("bianLines", bianLines, SIX);
  }

  return Array.from({ length: SIX }, (_, i) => {
    const row: PanYaoDisplayRow = {
      liushou: liushouLabels[i]!,
      ben: benLines[i]!,
      moving: movingRows[i]!
    };
    if (hasBian && bianLines) {
      row.bian = bianLines[i]!;
    }
    return row;
  });
}
