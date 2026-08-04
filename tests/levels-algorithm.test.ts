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

  it("guarantees the major low in the top-3 (flagged) and drops the micro shelf", () => {
    // Daily series whose LAST floor pivot (magnet) sits above both swing lows so
    // they qualify as failed-breakdown longs: PP = (6990+6930+6960)/3 = 6960.
    // Padded so ATR (14) is well-defined.
    const daily: Bar[] = [];
    for (let i = 0; i < 14; i++) {
      daily.push({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, open: 6960, high: 6985, low: 6935, close: 6960 });
    }
    daily.push({ date: "2026-07-31", open: 6960, high: 6990, low: 6930, close: 6960 });
    const plan = computeLevels(daily, "ES", null, swings);
    // The major detected low is present and flagged as the key shelf, even though
    // a nearer round-number level leads the ladder.
    expect(plan.top_long_trade).toContain("6,900");
    expect(plan.top_long_trade).toContain("major shelf ★");
    // The micro shelf must NOT be offered as a failed-breakdown long.
    expect(plan.top_long_trade).not.toContain("6,950");

    // Shorts are a ranked ladder of resistances ABOVE the magnet: reject-and-fail,
    // never the long's "flush + reclaim" (the mislabel bug this guards against).
    expect(plan.top_short_trade).toContain("reject");
    expect(plan.top_short_trade).not.toContain("flush + reclaim");
  });
});

describe("computeLevels — breakout enrichment (normal regime)", () => {
  // Bullish push, but still BELOW the ~1-month high (recentHigh 7700) so this is a
  // normal range day, not a breakout — the nearest-first ladder applies. With no
  // detected swings above price, enrichment must still produce near-price supports
  // and real upside targets (round numbers, prior high, extension).
  const daily: Bar[] = [];
  for (let i = 0; i < 14; i++) daily.push({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, open: 7600, high: 7620, low: 7560, close: 7600 });
  daily.push({ date: "2026-08-03", open: 7560, high: 7637.75, low: 7542.75, close: 7628.25 }); // PP ~ 7603
  const structure: any = { priorHigh: 7637.75, priorLow: 7542.75, priorClose: 7628.25, overnightHigh: 7567.75, overnightLow: 7543.5, priorWeekHigh: 7541, priorWeekLow: 7345.75, recentHigh: 7700, recentLow: 7345.75 };
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

describe("pickSetupLevels — real shelves beat round filler, major guaranteed", () => {
  it("keeps the nearest level, prefers real shelves, and always includes the major", async () => {
    const { pickSetupLevels, isRoundRef } = await import("../server/lib/levels-algorithm");
    const magnet = 7735.5;
    // Mirrors the real Aug 5 support side: two nearby round-number fillers, a
    // couple of real detected shelves, and a far MAJOR shelf.
    const supports: any = [
      { price: 7725, prominence: 0, tier: "minor" },     // round filler
      { price: 7700, prominence: 0, tier: "minor" },     // round filler
      { price: 7666, prominence: 0, tier: "minor" },     // overnight high (structure, non-round)
      { price: 7649.25, prominence: 42, tier: "minor" }, // detected shelf
      { price: 7631.75, prominence: 88, tier: "major" }, // MAJOR detected shelf (far)
      { price: 7591, prominence: 0, tier: "minor" },
    ];
    const picked = pickSetupLevels(supports, magnet, "below", 25).map((p: any) => p.price);
    // Nearest round-number level still leads (the first pullback).
    expect(picked[0]).toBe(7725);
    // The far MAJOR shelf is guaranteed in the three despite being furthest.
    expect(picked).toContain(7631.75);
    // Round-number classification is correct (7,725 is filler; 7,631.75 is not).
    expect(isRoundRef({ price: 7725, prominence: 0 }, 25)).toBe(true);
    expect(isRoundRef({ price: 7631.75, prominence: 88 }, 25)).toBe(false);
    expect(isRoundRef({ price: 7666, prominence: 0 }, 25)).toBe(false); // non-round structure
  });
});

describe("computeLevels — momentum/breakout regime", () => {
  // Price pressed right up to a new recent high (broken out / vertical), with a
  // deep MAJOR reaction low well below the magnet. The plan should flip to the
  // patience script: lead with the deep A+, flag chasing, and mute shorts.
  const daily: Bar[] = [];
  for (let i = 0; i < 14; i++) daily.push({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, open: 7700, high: 7720, low: 7680, close: 7700 });
  // Last session closes at the top of its range → bullish + at the recent high.
  daily.push({ date: "2026-08-04", open: 7710, high: 7772, low: 7705, close: 7765 });
  const structure: any = {
    priorHigh: 7772, priorLow: 7705, priorClose: 7765,
    overnightHigh: 7666, overnightLow: 7629,
    priorWeekHigh: 7541, priorWeekLow: 7345.75,
    recentHigh: 7772, recentLow: 7345.75,
  };
  const swings: any = {
    lows: [7666, 7649.25, 7631.75, 7427.5], highs: [7772],
    lowPoints: [
      { price: 7666, prominence: 8, tier: "minor" },
      { price: 7649.25, prominence: 42, tier: "minor" },
      { price: 7631.75, prominence: 96, tier: "major" }, // nearest major = the actionable A+
      { price: 7427.5, prominence: 240, tier: "major" }, // deepest/highest-prominence, but far & stale
    ],
    highPoints: [{ price: 7772, prominence: 90, tier: "major" }],
  };
  const r = computeLevels(daily, "ES", structure, swings);

  it("flags the momentum regime", () => {
    expect(r.levels.regime).toBe("momentum");
    expect(r.bias).toBe("bullish");
  });

  it("leads with the NEAREST major A+, not the deepest/most-prominent stale low", () => {
    expect(r.top_long_trade).toContain("Best long (A+)");
    expect(r.top_long_trade).toContain("7,631.75");
    // The far, higher-prominence 7,427.5 must NOT be chosen as the A+.
    expect(r.top_long_trade).not.toContain("7,427.5");
    // The patience message must be present and shallow dips called chases.
    expect(r.top_long_trade.toLowerCase()).toContain("patient");
    expect(r.top_long_trade.toLowerCase()).toContain("chase");
  });

  it("keeps the short LEVELS but frames them as not-the-edge scalps", () => {
    expect(r.top_short_trade.toLowerCase()).toContain("not the edge");
    // The short levels themselves are still listed (a resistance above price).
    expect(r.top_short_trade).toContain("🥇");
    expect(r.top_short_trade.toLowerCase()).toContain("scalp");
  });
});

describe("mergeSwings", () => {
  it("adds fresh fine shelves as minor and dedupes overlaps", async () => {
    const { mergeSwings } = await import("../server/lib/levels-algorithm");
    const coarse: any = {
      lows: [7542.75], highs: [7561.5],
      lowPoints: [{ price: 7542.75, prominence: 95, tier: "major" }],
      highPoints: [{ price: 7561.5, prominence: 93, tier: "major" }],
    };
    const fine: any = {
      lows: [7611, 7594, 7567, 7543], highs: [],
      lowPoints: [
        { price: 7611, prominence: 20, tier: "major" },
        { price: 7594, prominence: 15, tier: "minor" },
        { price: 7567, prominence: 12, tier: "minor" },
        { price: 7543, prominence: 5, tier: "micro" }, // near coarse 7542.75, and micro
      ],
      highPoints: [],
    };
    const merged = mergeSwings(coarse, fine, 7600);
    const prices = merged.lowPoints.map((p: any) => p.price);
    expect(prices).toContain(7611);
    expect(prices).toContain(7594);
    expect(prices).toContain(7567);
    // 7543 fine is micro AND overlaps coarse 7542.75 -> not double-added
    expect(prices.filter((p: number) => Math.abs(p - 7543) < 2).length).toBe(1);
    // fresh shelves are tagged minor, coarse stays major
    expect(merged.lowPoints.find((p: any) => p.price === 7594).tier).toBe("minor");
    expect(merged.lowPoints.find((p: any) => p.price === 7542.75).tier).toBe("major");
  });
});
