# Trade Levels Pro — How the daily levels & plan are built

This is our system, frozen as of marker `momentum-v11`. It reads market structure
only. It does **not** read anyone's newsletter. That's why we can validate it blind.

## Inputs
- ES and NQ price bars (OHLC), regular trading hours (RTH) session, pulled nightly
  after the cash close. That's the only input. No news, no discretion.

## 1. Anchors — where is the market centered
- **Magnet** = floor pivot = `(High + Low + Close) / 3`. Price gravitates back to it.
- **Dynamic Zone** = ATR band around recent action (ATR = average true range).
  Wide-range days → wider zone. This is the "fair value" box; its edges are reaction spots.

## 2. Shelves — where price actually turns (the core)
- Scan recent swing history for **fractal pivots** (local highs/lows that reversed).
- Score each by **prominence** (how sharply it stood out), then tier it:
  - **major** = strong, repeatedly-tested
  - **minor** = secondary
  - **micro** = noise (filtered out of setups)
- Enrich with **round numbers** (e.g. 7,800 / 7,850 — real futures magnets).
- These become the full support/resistance map on the terminal.

## 3. Regime — what kind of day is it
- Compare close vs pivot and vs the ~1-month high/low.
- **Bullish + pinned near recent high → momentum/breakout regime** → plan says
  *be patient, don't chase, wait for a flush-and-reclaim*.
- **Otherwise → normal regime** → standard level-to-level.
- This is why the plan's tone changes day to day with no manual edits.

## 4. The plan — what to actually do
Selected automatically from the map + regime:
- **A+ long** = nearest real shelf below the magnet (the failed-breakdown entry:
  flush it, reclaim it, go).
- **Backups** = deeper majors, labeled as backups.
- **Targets** = next real shelves above, toward/through the magnet.
- **Invalidation** = the range low (nearest support *below* the entries):
  "below X the long is off — breakdown-short territory."
- **Rejection shorts** = resistances above the magnet (secondary/scalp side).

**The edge encoded is the failed-breakdown:** price breaks a level, traps sellers,
reclaims, squeezes. Everything above just finds *where* that sets up each session.

## 5. Delivery
- Telegram (compact plan) + on-site terminal (full map, copy-to-chart, TradingView export).
- Next day: score yesterday's levels vs what actually happened → track record.

## One-line pitch
> We anchor to the daily pivot and an ATR fair-value zone, detect the real reaction
> shelves from swing structure, read whether it's a breakout or a range, and hand you
> the A+ failed-breakdown long, its targets, and the exact level where you're wrong —
> automatically, every session.

## Change policy
Rules are **frozen**. No edits tied to any single newsletter. Changes only after a
blind-validation window shows a systematic miss (see BLIND-LOG.md).
