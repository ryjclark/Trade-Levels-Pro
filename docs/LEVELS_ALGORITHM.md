# How Trade Levels Pro Builds the Daily Plan

This is the permanent, plain-English plus replication-grade spec for how the nightly
ES/NQ levels are generated. If the site ever breaks, this document plus the source
file `server/lib/levels-algorithm.ts` is enough to rebuild the entire plan from
scratch. Nothing here is hand-placed. Every number is computed from prior-session data.

Source of truth: `server/lib/levels-algorithm.ts` (algorithm version `v1.2`).
Keep this doc in sync whenever that file's formulas change.

---

## The one-paragraph version

Each night we take the prior session's price bars for the front contract, find the
price where the day balanced (the magnet), draw a volatility-scaled zone around it,
then scan the intraday bars for the spots where price actually flushed and bounced
(real shelves), score each by how hard it bounced, and rank them. The plan leads
with the strongest shelf just below the magnet as the A+ "failed breakdown" long,
lists the next shelves as backups, points targets at the resistances above, and
flags fades at resistance as secondary shorts. The newsletter writes 1,500 words to
arrive at the same shelves we find with math.

---

## Inputs

- About 3 months of daily bars (oldest to newest) for trend/structure.
- Intraday bars (used at two resolutions, coarse and fine, then merged) for swing
  detection and the market profile.
- The contract is the pinned front future (for example `ESZ26.CME`), pulled from
  Yahoo. See `YAHOO_SYMBOL` in the source. This needs a manual quarterly roll.

Per-symbol constants (from the source):

| Symbol | Tick  | Round step |
|--------|-------|------------|
| ES     | 0.25  | 25         |
| NQ     | 0.25  | 100        |
| GC     | 0.10  | 10         |
| CL     | 0.01  | 1          |
| RTY    | 0.10  | 10         |

`roundToTick(v, t) = round(v / t) * t`. Every emitted level is snapped to the tick.

---

## Step 1: The magnet and the dynamic zone

From the prior session's High (H), Low (L), Close (C):

- **Magnet** = (H + L + C) / 3, snapped to tick. This is the classic floor-trader
  pivot, the price the day tends to gravitate to and balance around.
- **ATR** = 14-period Average True Range. True Range per bar is
  `max(high - low, |high - prevClose|, |low - prevClose|)`, averaged over the last 14.
- **Dynamic Zone** = magnet plus/minus (0.25 x ATR), each edge snapped to tick.
  - Zone top = magnet + 0.25 x ATR
  - Zone bottom = magnet - 0.25 x ATR

The zone is the balance band. Inside it price is chopping around fair value. Outside
it price is trending. Because it scales with ATR, the band automatically widens on
volatile days and tightens on quiet ones. No fixed point value is ever used.

A secondary pivot ladder is also computed (R1-R4, S1-S4) with the standard pivot
formulas, but these are reference only. They are NOT the displayed trade.

```
r1 = 2*PP - L      s1 = 2*PP - H
r2 = PP + (H-L)    s2 = PP - (H-L)
r3 = H + 2*(PP-L)  s3 = L - 2*(H-PP)
r4 = r3 + (r3-r2)  s4 = s3 - (s2-s3)
```

---

## Step 2: Real shelves (swing detection + prominence)

This is the engine, and it is what separates the plan from a generic pivot
calculator. It scans the intraday bars for genuine reaction points (fractals):

- A bar is a **swing low** if its low is the lowest across the surrounding window
  (default window = 3 bars each side, so lowest of 7 bars).
- A bar is a **swing high** if its high is the highest across the same window.

Each pivot is scored by **prominence**, which measures how hard price bounced:

- For a swing low: prominence = (highest high in the next up-to-12 bars) minus the
  pivot low. A shelf that launched a big rally scores high. A shelf price barely
  blipped off scores low.
- For a swing high: prominence = the pivot high minus the lowest low in the next
  up-to-12 bars.

Then the pivots are cleaned up:

1. **Cluster**: pivots within about 0.1% of each other are merged into one shelf,
   keeping the highest-prominence member.
2. **Tier** by prominence relative to the single strongest shelf on the board
   (supports and resistances compared together, so "major" means major overall):
   - ratio >= 0.5  -> **major**
   - ratio >= 0.25 -> **minor**
   - below that     -> **micro** (usually dropped)

The coarse and fine intraday passes are detected separately and merged, so both
big structural shelves and tighter intraday shelves survive.

This is where levels like 7,685.5 (major) and 7,705 (minor) come from. They are not
formulas. They are the exact prices where this contract flushed and reversed.

---

## Step 3: Context layers

Three more layers are stacked on so the plan always has near-price levels and
beyond-price targets:

- **Market Profile (TPO)**: a time-at-price profile built from 30-minute bars.
  Splits the range into about 40 rows, finds the POC (the row touched the most,
  the most-traded price), then greedily expands out from the POC until it covers
  about 70% of the time to get the value area (VAH high, VAL low). Carried forward
  as next-day reference.
- **Structure**: prior-session high/low/close, overnight high/low, prior-week
  high/low, and the ~1-month recent high/low.
- **Round-number filler**: added only when a side is thin on real shelves, so there
  is always a level near price. A round ref has prominence 0 and sits exactly on the
  round-number grid (a multiple of the symbol's round step). Real detected shelves
  always win over round filler.

---

## Step 4: Bias and regime

**Bias** (where the close sits versus the zone):

- Close above zone top -> **bullish**
- Close below zone bottom -> **bearish**
- Inside the zone -> **neutral**, but upgraded:
  - if price is within 1 ATR of the ~1-month high -> bullish (consolidation at
    highs is not truly neutral)
  - if within 1 ATR of the ~1-month low -> bearish

**Regime**:

- **momentum** if bias is bullish AND price is pressed up near the recent high.
  In this mode the plan leads with the deeper A+ failed-breakdown, treats shallow
  dips as chases, stretches upside targets (parabolic targets still appear), and
  mutes shorts.
- **normal** otherwise. Nearest-first ladder applies.

---

## Step 5: The displayed trade (the failed-breakdown plan)

Everything above feeds the final assembly. Levels sitting essentially ON the magnet
(within about 0.1%) are excluded, so the #1 long is a real range shelf, not the
pivot itself.

- **A+ long** = the nearest **major real shelf below the magnet**. The setup is:
  price flushes the shelf, reclaims it, you go long. Tomorrow's example: 7,705 /
  7,685.5.
- **Backups (Long 2, Long 3)** = the next real shelves down. Round-number filler is
  used only if real shelves run out. The code guarantees the strongest major shelf
  is always among the picks, so the A+ is never buried under round numbers.
- **Targets** = momentum targets built from the resistances above, with the 3rd
  (runner) target stretched to the next major objective roughly a full leg beyond.
- **Invalid** = below the entry floor. Your stop reference.
- **Shorts** = rejection fades at the resistances above the magnet. Flagged as
  secondary, lower win-rate. (The strategy is long-biased by design; shorts exist
  for those who want them.)

When two levels land on the same price (for example Target 1 and Short 3, or Invalid
and Long 3) the TradingView indicator merges them into one combined label instead of
stacking.

---

## Why this is trustworthy

- It is fully mechanical and reproducible: same bars in, same levels out.
- The shelves are real reaction points scored by actual follow-through, not drawn
  by eye and not arbitrary pivot math.
- The magnet and zone anchor everything to volatility-scaled fair value.
- The bias and regime logic adapt the plan to trend versus range without any
  hardcoded price levels.

If you ever need to rebuild this: the formulas above plus `levels-algorithm.ts` are
complete. The key functions are `computeLevels` (orchestrator), `detectSwings`
(shelves + prominence), `computeTpoProfile` (market profile), `pickSetupLevels`
(ranking the longs/shorts), `pickMomentumTargets`, and `computePlanTrade` /
`buildPlan` (final assembly).
