import { describe, expect, it } from "vitest";

import { parseCountYongshenGridPayload } from "./api";

describe("parseCountYongshenGridPayload", () => {
  it("accepts 144 finite values and month/day zhi", () => {
    const values = Array.from({ length: 144 }, (_, i) => i * 0.01);
    const parsed = parseCountYongshenGridPayload({
      values,
      month_zhi: "寅",
      current_day_zhi: "午",
      xunkong: "戌亥"
    });
    expect(parsed).toEqual({
      values,
      month_zhi: "寅",
      current_day_zhi: "午"
    });
  });

  it("rejects wrong length or non-numbers", () => {
    expect(
      parseCountYongshenGridPayload({
        values: Array(12).fill(0),
        month_zhi: "子",
        current_day_zhi: "子"
      })
    ).toBeNull();
    const values = Array(144).fill(0);
    values[3] = "0";
    expect(
      parseCountYongshenGridPayload({
        values,
        month_zhi: "子",
        current_day_zhi: "子"
      })
    ).toBeNull();
  });
});
