import { useEffect, useRef } from "react";

// TradingView's free, open-source Lightweight Charts, loaded from CDN (the app
// runs with CSP disabled, same as the existing tv.js embed). Pinned to a v4
// build so the addCandlestickSeries / createPriceLine API stays stable.
declare global {
  interface Window {
    LightweightCharts?: any;
  }
}

const LWC_SRC =
  "https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js";
let lwcPromise: Promise<void> | null = null;

function loadLwc(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.LightweightCharts) return Promise.resolve();
  if (lwcPromise) return lwcPromise;
  lwcPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${LWC_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("lwc failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = LWC_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("lwc failed"));
    document.head.appendChild(s);
  });
  return lwcPromise;
}

export interface TerminalBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TerminalLevels {
  magnet: number | null;
  dynamicZoneTop: number | null;
  dynamicZoneBottom: number | null;
  priorHigh: number | null;
  priorLow: number | null;
  priorClose: number | null;
  overnightHigh: number | null;
  overnightLow: number | null;
  // Higher-timeframe (swing) layer — drawn dimmer/dotted.
  priorWeekHigh: number | null;
  priorWeekLow: number | null;
  recentHigh: number | null;
  recentLow: number | null;
}

export type SwingTier = "major" | "minor" | "micro";
export interface SwingPoint {
  price: number;
  prominence: number;
  tier: SwingTier;
}
export interface SwingLevels {
  lows: number[];
  highs: number[];
  lowPoints?: SwingPoint[];
  highPoints?: SwingPoint[];
}

export interface PlanTrade {
  aplus: number | null;
  backups: number[];
  targets: number[];
  invalid: number | null;
}
export interface ChartProfile {
  poc: number | null;
  vah: number | null;
  val: number | null;
  date?: string | null;
}

type Props = {
  bars: TerminalBar[];
  levels: TerminalLevels | null;
  swings?: SwingLevels | null;
  trade?: PlanTrade | null;
  profile?: ChartProfile | null;
  height?: number;
};

export default function LevelsTerminalChart({ bars, levels, swings, trade, profile, height = 520 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let chart: any = null;
    let ro: ResizeObserver | null = null;

    loadLwc()
      .then(() => {
        const el = containerRef.current;
        if (cancelled || !el || !window.LightweightCharts || bars.length === 0) return;

        chart = window.LightweightCharts.createChart(el, {
          width: el.clientWidth,
          height,
          layout: {
            background: { type: "solid", color: "#0a0e17" },
            textColor: "#9fb0c3",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 11,
          },
          grid: {
            vertLines: { color: "rgba(148,163,184,0.06)" },
            horzLines: { color: "rgba(148,163,184,0.06)" },
          },
          rightPriceScale: {
            borderColor: "rgba(148,163,184,0.15)",
            scaleMargins: { top: 0.12, bottom: 0.12 },
          },
          timeScale: {
            borderColor: "rgba(148,163,184,0.15)",
            timeVisible: true,
            secondsVisible: false,
            rightOffset: 5,
            barSpacing: 9,
          },
          crosshair: { mode: 1 }, // magnet crosshair
        });

        const series = chart.addCandlestickSeries({
          upColor: "#26a69a",
          downColor: "#ef5350",
          borderVisible: false,
          wickUpColor: "#26a69a",
          wickDownColor: "#ef5350",
        });
        series.setData(bars);

        const addLine = (price: number, color: string, title: string, dashed = false, width = 1) => {
          series.createPriceLine({
            price,
            color,
            lineWidth: width,
            lineStyle: dashed ? 2 : 0,
            axisLabelVisible: true,
            title,
          });
        };

        // Curate a clean set: Magnet + Zone, plus only the NEAREST few supports /
        // resistances (merged from structure + swings), clustered so labels never
        // overlap. Far levels stay in the list below the chart, off the chart.
        if (levels) {
          const px = bars[bars.length - 1].close;
          const tol = px * 0.0012; // ~0.12% cluster tolerance
          const pick = (cands: Array<number | null | undefined>, side: "below" | "above") => {
            const vals = cands.filter((v): v is number => v != null && (side === "below" ? v < px : v > px));
            vals.sort((a, b) => (side === "below" ? b - a : a - b)); // nearest to price first
            const kept: number[] = [];
            for (const v of vals) {
              if (kept.some((k) => Math.abs(k - v) < tol)) continue;
              kept.push(v);
              if (kept.length >= 3) break;
            }
            return kept;
          };

          // Quality ranking: draw major/minor swing levels only (drop micro shelves
          // as noise) and weight majors with a thicker line. Structure levels have
          // no tier, so they're always kept at normal weight.
          const tierMap = new Map<number, SwingTier>();
          (swings?.lowPoints ?? []).forEach((p) => tierMap.set(p.price, p.tier));
          (swings?.highPoints ?? []).forEach((p) => tierMap.set(p.price, p.tier));
          const swingLows = swings?.lowPoints
            ? swings.lowPoints.filter((p) => p.tier !== "micro").map((p) => p.price)
            : swings?.lows ?? [];
          const swingHighs = swings?.highPoints
            ? swings.highPoints.filter((p) => p.tier !== "micro").map((p) => p.price)
            : swings?.highs ?? [];
          const widthFor = (v: number) => (tierMap.get(v) === "major" ? 2 : 1);

          const supports = pick(
            [levels.priorLow, levels.overnightLow, levels.priorWeekLow, ...swingLows],
            "below",
          );
          const resistances = pick(
            [levels.priorHigh, levels.overnightHigh, levels.priorWeekHigh, ...swingHighs],
            "above",
          );

          // Dynamic Zone — faint dashed band around the magnet.
          if (levels.dynamicZoneTop != null) addLine(levels.dynamicZoneTop, "rgba(148,163,184,0.5)", "", true);
          if (levels.dynamicZoneBottom != null) addLine(levels.dynamicZoneBottom, "rgba(148,163,184,0.5)", "", true);
          // Prior-session profile (context) — purple POC + dotted value area.
          if (profile) {
            if (profile.poc != null) addLine(profile.poc, "#c084fc", "POC", false, 2);
            if (profile.vah != null) addLine(profile.vah, "rgba(192,132,252,0.6)", "VAH", true);
            if (profile.val != null) addLine(profile.val, "rgba(192,132,252,0.6)", "VAL", true);
          }
          // Magnet — the one bright anchor.
          if (levels.magnet != null) addLine(levels.magnet, "#eab308", "Magnet", false, 2);

          const hasTrade =
            trade && (trade.aplus != null || trade.targets.length > 0 || trade.invalid != null);
          if (hasTrade) {
            // The exact plan trade — same setup as Telegram, drawn on the chart.
            trade!.targets.slice(0, 3).forEach((v, i) => addLine(v, "#22d3ee", `T${i + 1}`, false, i === 0 ? 2 : 1));
            if (trade!.aplus != null) addLine(trade!.aplus, "#4ade80", "A+ LONG", false, 3);
            trade!.backups.slice(0, 2).forEach((v) => addLine(v, "rgba(74,222,128,0.7)", "Long", false, 1));
            if (trade!.invalid != null) addLine(trade!.invalid, "#ef4444", "✕ Invalid", true, 2);
          } else {
            // Fallback (no plan trade): nearest supports / resistances, majors thicker.
            resistances.forEach((v) => addLine(v, "#ef5350", "R", false, widthFor(v)));
            supports.forEach((v) => addLine(v, "#26a69a", "S", false, widthFor(v)));
          }
        }

        // Zoom to the last ~110 bars so candles are readable (not 900 crammed in).
        const n = bars.length;
        try {
          chart.timeScale().setVisibleLogicalRange({ from: Math.max(0, n - 110), to: n + 5 });
        } catch {
          chart.timeScale().fitContent();
        }

        ro = new ResizeObserver(() => {
          if (chart && el) chart.applyOptions({ width: el.clientWidth });
        });
        ro.observe(el);
      })
      .catch(() => {
        // CDN/network failure is non-fatal — leave an empty container.
      });

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
      if (chart) chart.remove();
    };
  }, [bars, levels, swings, trade, profile, height]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      data-testid="levels-terminal-chart"
    />
  );
}
