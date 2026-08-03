import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TradingViewChart from "../client/src/components/TradingViewChart";

describe("TradingViewChart", () => {
  it("renders a container div with the default SPX proxy symbol testid", () => {
    const html = renderToStaticMarkup(createElement(TradingViewChart));
    expect(html).toContain('data-testid="tv-chart-FOREXCOM:SPXUSD"');
    expect(html).toContain('data-testid="tv-chart-container"');
    expect(html).toContain("S&amp;P 500 reference chart (TradingView)");
  });

  it("symbol prop overrides the default", () => {
    const html = renderToStaticMarkup(
      createElement(TradingViewChart, { symbol: "CME_MINI:NQ1!" }),
    );
    expect(html).toContain('data-testid="tv-chart-CME_MINI:NQ1!"');
    expect(html).not.toContain('data-testid="tv-chart-FOREXCOM:SPXUSD"');
  });

  it("respects custom height", () => {
    const html = renderToStaticMarkup(
      createElement(TradingViewChart, { height: 333 }),
    );
    expect(html).toContain("height:333px");
  });
});
