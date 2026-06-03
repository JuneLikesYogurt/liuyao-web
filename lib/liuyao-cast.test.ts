import { describe, expect, it } from "vitest";

import {
  emptyLines,
  isLinesComplete,
  lineIndexForShake,
  linesToResultString
} from "./liuyao-cast";

describe("liuyao-cast", () => {
  it("lineIndexForShake maps k=1..6 to 初爻..上爻 indices", () => {
    expect(lineIndexForShake(1)).toBe(5);
    expect(lineIndexForShake(6)).toBe(0);
  });

  it("linesToResultString reverses for 初爻-first backend", () => {
    const lines = emptyLines();
    lines[5] = 0;
    lines[4] = 1;
    lines[3] = 2;
    lines[2] = 3;
    lines[1] = 1;
    lines[0] = 2;
    expect(linesToResultString(lines)).toBe("012312");
  });

  it("returns null when incomplete", () => {
    const lines = emptyLines();
    lines[5] = 1;
    expect(isLinesComplete(lines)).toBe(false);
    expect(linesToResultString(lines)).toBeNull();
  });
});
