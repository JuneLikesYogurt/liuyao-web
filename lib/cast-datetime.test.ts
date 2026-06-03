import { describe, expect, it } from "vitest";

import {
  datetimeLocalToCastString,
  formatCastDateTime,
  isValidManualCastDatetimeLocal,
  parseCastDateTime
} from "./cast-datetime";

describe("cast-datetime", () => {
  it("datetimeLocalToCastString uses :00 seconds", () => {
    expect(datetimeLocalToCastString("2024-06-15T14:30")).toBe(
      "2024-06-15 14:30:00"
    );
  });

  it("formatCastDateTime matches parse round-trip shape", () => {
    const d = new Date(2024, 5, 15, 14, 30, 45);
    const s = formatCastDateTime(d);
    expect(s).toBe("2024-06-15 14:30:45");
    expect(parseCastDateTime(s)?.getTime()).toBe(d.getTime());
  });

  it("rejects future manual datetime beyond grace", () => {
    const far = new Date(Date.now() + 3600_000);
    const y = far.getFullYear();
    const m = String(far.getMonth() + 1).padStart(2, "0");
    const d = String(far.getDate()).padStart(2, "0");
    const h = String(far.getHours()).padStart(2, "0");
    const min = String(far.getMinutes()).padStart(2, "0");
    expect(isValidManualCastDatetimeLocal(`${y}-${m}-${d}T${h}:${min}`)).toBe(
      false
    );
  });
});
