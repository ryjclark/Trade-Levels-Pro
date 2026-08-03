import { describe, it, expect } from "vitest";
import {
  computeLevels,
  detectSwings,
  type Bar,
  type IntradayBar,
} from "../server/lib/levels-algorithm";

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

  it("generates a reactive trading plan referencing the levels", () => {
    expect(levels.bias_reasoning.length).toBeGreaterThan(0);
    expect(levels.top_long_trade.length).toBeGreaterThan(0);
    expect(levels.top_short_trade.length).toBeGreaterThan(0);
    // Setups should reference the magnet number so they're tied to real levels.
    const magnetStr = levels.magnet.toLocaleString("en-US", { maximumFractionDigits: 2 });
    expect(levels.top_long_trade).toContain(magnetStr);
    expect(levels.top_short_trade).toContain(magnetStr);
  });

  it("targets the next trading day (skips weekends) and reports a valid bias", () => {
    // 2026-07-31 is a Friday, so the next trading day is Monday 2026-08-03.
    expect(levels.target_date).toBe("2026-08-03");
    expect(["bullish", "neutral", "bearish"]).toContain(levels.bias);
  });
});

/**
 * Intraday series with a DEEP reaction low (~6900, big bounce → major) and a
 * SHALLOW dip (~6950, tiny bounce → micro), so quality ranking has something to
 * separate.
 */
function makeSwingBars(): IntradayBar[] {
  const lows =  [6990,6980,6970,6960,6950,6930,6900,6930,6955,6975,6980,6978,6976,6974,6972,6968,6962,6958,6955,6952,6950,6953,6956,6958,6959,6960];
  const highs = [6995,6985,6975,6965,6955,6935,6905,6960,6980,7000,6995,6990,6988,6986,6984,6980,6974,6968,6962,6958,6955,6960,6962,6963,6964,6965];
  return lows.map((low, i) => ({
    time: 1_780_000_000 + i * 1800,
    open: low + 2,
    high: highs[i],
    low,
    close: low + 3,
  }));
}

describe("detectSwings — quality ranking", () => {
  const swings = detectSwings(makeSwingBars(), "ES");

  it("ranks a deep reaction low as major and a shallow dip as micro", () => {
    const major = swings.lowPoints.find((p) => Math.abs(p.price - 6900) <= 1);
    const micro = swings.lowPoints.find((p) => Math.abs(p.price - 6950) <= 1);
    expect(major?.tier).toBe("major");
    expect(micro?.tier).toBe("micro");
    // Higher-prominence level really is stronger.
    expect(major!.prominence).toBeGreaterThan(micro!.prominence);
  });

  it("keeps lowPoints aligned with lows and sorted high → low by price", () => {
    expect(swings.lowPoints.map((p) => p.price)).toEqual(swings.lows);
    for (let i = 1; i < swings.lows.length; i++) {
      expect(swings.lows[i - 1]).toBeGreaterThan(swings.lows[i]);
    }
  });

  it("leads the plan with the major low and drops the micro shelf", () => {
    // Daily series whose LAST floor pivot (magnet) sits above both swing lows so
    // they qualify as failed-breakdown longs: PP = (6990+6930+6960)/3 = 6960.
    // Padded so ATR (14) is well-defined.
    const daily: Bar[] = [];
    for (let i = 0; i < 14; i++) {
      daily.push({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, open: 6960, high: 6985, low: 6935, close: 6960 });
    }
    daily.push({ date: "2026-07-31", open: 6960, high: 6990, low: 6930, close: 6960 });
    const plan = computeLevels(daily, "ES", null, swings);
    expect(plan.top_long_trade).toContain("6,900");
    expect(plan.top_long_trade).toContain("significant low");
    // The micro shelf must NOT be offered as a failed-breakdown long.
    expect(plan.top_long_trade).not.toContain("6,950");

    // Shorts are a ranked ladder of resistances ABOVE the magnet and must be
    // labelled as highs, never "low" (the bug this guards against).
    expect(plan.top_short_trade).toContain("significant high");
    expect(plan.top_short_trade).not.toContain("significant low");
  });
});

describe("computeLevels — breakout enrichment", () => {
  // Price at new highs with no swings above: plan must still produce near-price
  // supports and real upside targets (round numbers, prior high, extension).
  const daily: Bar[] = [];
  for (let i = 0; i < 14; i++) daily.push({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, open: 7600, high: 7620, low: 7560, close: 7600 });
  daily.push({ date: "2026-08-03", open: 7560, high: 7637.75, low: 7542.75, close: 7628.25 }); // PP ~ 7603
  const structure: any = { priorHigh: 7637.75, priorLow: 7542.75, priorClose: 7628.25, overnightHigh: 7567.75, overnightLow: 7543.5, priorWeekHigh: 7541, priorWeekLow: 7345.75, recentHigh: 7637.75, recentLow: 7345.75 };
  const swings: any = {
    lows: [7542.75, 7427.5, 7399], highs: [7561.5, 7526],
    lowPoints: [{ price: 7542.75, prominence: 95, tier: "major" }, { price: 7427.5, prominence: 113, tier: "major" }, { price: 7399, prominence: 99, tier: "major" }],
    highPoints: [{ price: 7561.5, prominence: 93, tier: "major" }, { price: 7526, prominence: 108, tier: "major" }],
  };
  const r = computeLevels(daily, "ES", structure, swings);

  it("produces multiple upside targets above the magnet even with no swings above", () => {
    expect(r.levels.swingResistances.filter((v) => v > r.magnet).length).toBeGreaterThan(2);
    expect(r.top_short_trade).toContain("7,637"); // prior-day high as a target
  });

  it("leads longs with near-price supports, not just the deep detected lows", () => {
    // 7,567.75 (his 'first support') or 7,600 should appear before the deep 7,427.
    expect(r.top_long_trade).toMatch(/7,600|7,567/);
  });

  it("gives longs a real upside target above the magnet", () => {
    expect(r.top_long_trade).toMatch(/7,62[0-9]|7,63[0-9]/);
  });
});
