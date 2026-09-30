import { describe, expect, it } from "vitest";

import {
  coinsToLine,
  emptyLines,
  isLinesComplete,
  lineIndexForShake,
  linesToResultString,
  nextCoinRotation,
  type CoinFace
} from "./liuyao-cast";

describe("liuyao-cast", () => {
  it("lineIndexForShake maps k=1..6 to 初爻..上爻 indices", () => {
    expect(lineIndexForShake(1)).toBe(5);
    expect(lineIndexForShake(6)).toBe(0);
  });

  it("linesToResultString preserves 上爻-first order for backend", () => {
    const lines = emptyLines();
    lines[5] = 0;
    lines[4] = 1;
    lines[3] = 2;
    lines[2] = 3;
    lines[1] = 1;
    lines[0] = 2;
    expect(linesToResultString(lines)).toBe("213210");
  });

  it("returns null when incomplete", () => {
    const lines = emptyLines();
    lines[5] = 1;
    expect(isLinesComplete(lines)).toBe(false);
    expect(linesToResultString(lines)).toBeNull();
  });
});

describe("coinsToLine", () => {
  const zi = 0 as CoinFace;
  const bei = 1 as CoinFace;

  it("maps all 8 字/背 combinations to 四象", () => {
    expect(coinsToLine([zi, zi, zi])).toBe(0);
    expect(coinsToLine([zi, zi, bei])).toBe(1);
    expect(coinsToLine([zi, bei, zi])).toBe(1);
    expect(coinsToLine([bei, zi, zi])).toBe(1);
    expect(coinsToLine([zi, bei, bei])).toBe(2);
    expect(coinsToLine([bei, zi, bei])).toBe(2);
    expect(coinsToLine([bei, bei, zi])).toBe(2);
    expect(coinsToLine([bei, bei, bei])).toBe(3);
  });
});

describe("nextCoinRotation", () => {
  it("adds a half-turn when switching 背 to 字, whole turns when staying 背", () => {
    expect(nextCoinRotation(0, 1, 4)).toBe(1440);
    expect(nextCoinRotation(0, 0, 4)).toBe(1620);
    expect(nextCoinRotation(180, 0, 2)).toBe(900);
    expect(nextCoinRotation(180, 1, 2)).toBe(1080);
  });
});
