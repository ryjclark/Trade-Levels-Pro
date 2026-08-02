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
  r1: number | null; r2: number | null; r3: number | null; r4: number | null;
  s1: number | null; s2: number | null; s3: number | null; s4: number | null;
  dynamicZoneTop: number | null;
  dynamicZoneBottom: number | null;
}

type Props = {
  bars: TerminalBar[];
  levels: TerminalLevels | null;
  height?: number;
};

export default function LevelsTerminalChart({ bars, levels, height = 520 }: Props) {
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
          layout: { background: { color: "transparent" }, textColor: "#cbd5e1" },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.05)" },
            horzLines: { color: "rgba(255,255,255,0.05)" },
          },
          rightPriceScale: { borderColor: "rgba(255,255,255,0.12)" },
          timeScale: { borderColor: "rgba(255,255,255,0.12)", timeVisible: true, secondsVisible: false },
          crosshair: { mode: 0 },
        });

        const series = chart.addCandlestickSeries({
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        });
        series.setData(bars);

        const addLine = (price: number | null, color: string, title: string, dashed = false) => {
          if (price == null) return;
          series.createPriceLine({
            price,
            color,
            lineWidth: 1,
            lineStyle: dashed ? 2 : 0, // 0 = solid, 2 = dashed
            axisLabelVisible: true,
            title,
          });
        };

        if (levels) {
          addLine(levels.r4, "#f87171", "R4");
          addLine(levels.r3, "#f87171", "R3");
          addLine(levels.r2, "#f87171", "R2");
          addLine(levels.r1, "#f87171", "R1");
          addLine(levels.dynamicZoneTop, "#94a3b8", "DZ↑", true);
          addLine(levels.magnet, "#eab308", "Magnet");
          addLine(levels.dynamicZoneBottom, "#94a3b8", "DZ↓", true);
          addLine(levels.s1, "#4ade80", "S1");
          addLine(levels.s2, "#4ade80", "S2");
          addLine(levels.s3, "#4ade80", "S3");
          addLine(levels.s4, "#4ade80", "S4");
        }

        chart.timeScale().fitContent();

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
  }, [bars, levels, height]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      data-testid="levels-terminal-chart"
    />
  );
}
