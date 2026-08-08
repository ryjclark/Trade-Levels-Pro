# v2 upgrades — captured, GATED on validation

These are real accuracy upgrades we discussed. **Do not build any of them until the
blind-validation window (see BLIND-LOG.md) shows a systematic gap.** Rules are frozen;
adding a data layer mid-window would invalidate the test. This file exists so the ideas
aren't lost, not as a to-do to start now.

## Decision rule
Only pull one of these off the shelf if blind validation shows a *specific, recurring*
miss it would fix. Match the tool to the gap:
- Magnet keeps missing where price actually pins → volume profile POC.
- Our "zone" is too wide/narrow vs where price accepts → value area (VAH/VAL).
- Targets overshoot/undershoot → HVN/LVN nodes.

---

## 1. Volume / Market Profile  (HIGHEST-VALUE upgrade)
Built from **historical** session data, so it CAN be pre-computed into the nightly plan.
Maps almost 1:1 onto what we already do, but volume-grounded instead of price-only:

| Current (price-only) | Profile upgrade |
|---|---|
| Magnet = floor pivot (H+L+C)/3 | **POC** = price with the most volume traded (truer magnet) |
| Dynamic Zone = ATR band | **Value Area (VAH/VAL)** = where ~70% of volume traded (real acceptance zone) |
| Swing shelves | **HVN** (volume shelves, price stalls) / **LVN** (thin, price rips through → clean targets) |
| — | **Naked / virgin POCs** from prior days = strong pull-back magnets |

**Blocker / path:** our live feed is Yahoo OHLC bars = NO volume-at-price. True profile
needs tick/volume granularity. We already have that source — **Databento** (the feed
behind the separate levels-algorithm R&D tool). So the path is: compute POC / VAH / VAL /
HVN / LVN from Databento in the generator, add them to the levels object + terminal, and
either replace or blend with the pivot magnet / ATR zone. Validate the blended version
against the same blind log before shipping.

## 2. Order flow  (LIVE feature, NOT the nightly plan)
Order flow (DOM, footprint, cumulative delta, tape) only exists in real time — there's no
order flow until the session is live, so it cannot be baked into a pre-generated plan.

Where it fits: the **execution trigger** for setups we already publish. The plan says
"wait for the flush and reclaim" at the A+ level; order flow is how you *confirm the
reclaim is real* in the moment (delta flips positive, absorption / bids step in at the
level, sellers fail to extend). It confirms the levels, it does not change them.

**Home for this = Future Edge** (the live AI copilot), as a "is this reclaim real?"
confirmation layer, kept separate from the daily Trade Levels Pro plan.
