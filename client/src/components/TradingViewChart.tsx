import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

const SCRIPT_SRC = "https://s3.tradingview.com/tv.js";
let scriptPromise: Promise<void> | null = null;

function loadTradingViewScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("tv.js failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("tv.js failed"));
    document.head.appendChild(s);
  });

  return scriptPromise;
}

let instanceCounter = 0;

type Props = {
  symbol?: string;
  interval?: string;
  height?: number;
  theme?: "dark" | "light";
};

export default function TradingViewChart({
  // FOREXCOM:SPXUSD is the S&P 500 CFD — it tracks the index nearly 24h and
  // loads in the free TradingView embed. The index symbol SP:SPX requires a
  // paid TradingView data plan and triggers the "only available on
  // TradingView" popup in the free widget.
  symbol = "FOREXCOM:SPXUSD",
  interval = "60",
  height = 500,
  theme = "dark",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef<string>(`tv-chart-${++instanceCounter}`);

  useEffect(() => {
    let cancelled = false;
    const containerId = idRef.current;

    loadTradingViewScript()
      .then(() => {
        if (cancelled) return;
        if (!window.TradingView || !document.getElementById(containerId)) return;
        new window.TradingView.widget({
          container_id: containerId,
          symbol,
          interval,
          theme,
          autosize: true,
          style: "1",
          locale: "en",
          timezone: "Etc/UTC",
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: false,
          studies: ["RSI@tv-basicstudies"],
          enable_publishing: false,
          withdateranges: true,
          save_image: false,
        });
      })
      .catch(() => {
        // Network/CDN failures are non-fatal — leave the empty container.
      });

    return () => {
      cancelled = true;
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";
    };
  }, [symbol, interval, theme]);

  return (
    <div
      className="tv-chart-card"
      data-testid={`tv-chart-${symbol}`}
    >
      <div className="tv-chart-caption">
        Live S&amp;P 500 index chart powered by TradingView — tracks ES futures during cash market hours
      </div>
      <div
        id={idRef.current}
        ref={containerRef}
        style={{ width: "100%", height }}
        data-testid="tv-chart-container"
      />
    </div>
  );
}
