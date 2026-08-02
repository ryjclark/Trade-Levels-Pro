import { describe, it, expect } from "vitest";
import { computeLevels, type Bar } from "../server/lib/levels-algorithm";

/** Build a realistic ~50pt-range daily series ending on a known last bar. */
function makeBars(): Bar[] {
  const bars: Bar[] = [];
  for (let i = 0; i < 14; i++) {
    const base = 5700 + i * 8;
    bars.push({
      date: `2026-07-${String(i + 1).padStart(2, "0")}`,
      open: base,
      high: base + 40,
      low: base - 10,
      close: base + 20,
    });
  }
  // Final (previous) session the plan is computed from.
  bars.push({ date: "2026-07-31", open: 5820, high: 5850, low: 5800, close: 5840 });
  return bars;
}

describe("computeLevels", () => {
  const bars = makeBars();
  const levels = computeLevels(bars, "ES");

  it("produces a strictly descending ladder R4 > R3 > R2 > R1 > DZhigh > Magnet > DZlow > S1 > S2 > S3 > S4", () => {
    const ladder = [
      levels.r4,
      levels.r3,
      levels.r2,
      levels.r1,
      levels.dynamic_zone_high,
      levels.magnet,
      levels.dynamic_zone_low,
      levels.s1,
      levels.s2,
      levels.s3,
      levels.s4,
    ];
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i - 1]).toBeGreaterThan(ladder[i]);
    }
  });

  it("keeps dynamic_zone_high > magnet > dynamic_zone_low", () => {
    expect(levels.dynamic_zone_high).toBeGreaterThan(levels.magnet);
    expect(levels.magnet).toBeGreaterThan(levels.dynamic_zone_low);
  });

  it("rounds every level to the ES tick (0.25)", () => {
    const vals = [
      levels.current_price,
      levels.dynamic_zone_high,
      levels.dynamic_zone_low,
      levels.magnet,
      levels.r1, levels.r2, levels.r3, levels.r4,
      levels.s1, levels.s2, levels.s3, levels.s4,
    ];
    for (const v of vals) {
      expect(Math.round(v / 0.25)).toBeCloseTo(v / 0.25, 9);
    }
  });

  it("targets the next trading day (skips weekends) and reports a valid bias", () => {
    // 2026-07-31 is a Friday, so the next trading day is Monday 2026-08-03.
    expect(levels.target_date).toBe("2026-08-03");
    expect(["bullish", "neutral", "bearish"]).toContain(levels.bias);
  });
});
