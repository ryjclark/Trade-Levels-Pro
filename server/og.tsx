import * as React from "react";
import { ImageResponse } from "@vercel/og";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Plan } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BG = "#0c1117";
const TEAL = "#5EEAD4";
const TEXT = "#ffffff";
const MUTED = "rgba(255,255,255,0.55)";
const BORDER = "rgba(255,255,255,0.10)";
const ROSE = "#fb7185";
const EMERALD = "#34d399";

const FONT_DIR = path.join(__dirname, "assets", "fonts");

type LoadedFonts = {
  interRegular: Buffer;
  interBold: Buffer;
  interTightBold: Buffer;
};

let fontsCache: LoadedFonts | null = null;
function loadFonts(): LoadedFonts {
  if (fontsCache) return fontsCache;
  fontsCache = {
    interRegular: fs.readFileSync(path.join(FONT_DIR, "Inter-Regular.woff")),
    interBold: fs.readFileSync(path.join(FONT_DIR, "Inter-Bold.woff")),
    interTightBold: fs.readFileSync(path.join(FONT_DIR, "InterTight-Bold.woff")),
  };
  return fontsCache;
}

function buildFontList() {
  const f = loadFonts();
  return [
    { name: "Inter", data: f.interRegular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: f.interBold, weight: 700 as const, style: "normal" as const },
    { name: "InterTight", data: f.interTightBold, weight: 700 as const, style: "normal" as const },
  ];
}

function fmtDate(d: string): string {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function n(v: number | null | undefined): string {
  return v == null ? "—" : v.toLocaleString();
}

function biasColors(bias: string | null) {
  const b = (bias || "").toLowerCase();
  if (b.includes("bull")) return { bg: "rgba(34,197,94,0.16)", fg: "#4ade80", border: "rgba(74,222,128,0.45)" };
  if (b.includes("bear")) return { bg: "rgba(244,63,94,0.16)", fg: ROSE, border: "rgba(251,113,133,0.45)" };
  return { bg: "rgba(148,163,184,0.16)", fg: "#cbd5e1", border: "rgba(203,213,225,0.45)" };
}

function biasLabel(bias: string | null): string {
  const b = (bias || "").toLowerCase();
  if (b.includes("bull")) return "Bullish";
  if (b.includes("bear")) return "Bearish";
  if (b.includes("neutral")) return "Neutral";
  return "—";
}

function PlanCard({ plan }: { plan: Plan }) {
  const bias = biasColors(plan.bias);
  const rsRow = (label: string, value: number | null) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 18, fontSize: 26 }}>
      <span style={{ color: MUTED, fontWeight: 600, width: 56 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{n(value)}</span>
    </div>
  );

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        background: BG,
        color: TEXT,
        fontFamily: "Inter",
        padding: "56px 64px",
      }}
    >
      {/* Top brand band */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 6, height: 36, background: TEAL, borderRadius: 3, display: "flex" }} />
          <span
            style={{
              fontFamily: "InterTight",
              fontSize: 24,
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            TRADE LEVELS PRO
          </span>
        </div>
        <div
          style={{
            display: "flex",
            background: bias.bg,
            color: bias.fg,
            padding: "10px 22px",
            borderRadius: 999,
            border: `1px solid ${bias.border}`,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {biasLabel(plan.bias).toUpperCase()}
        </div>
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          marginTop: 44,
          fontFamily: "InterTight",
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: -1,
          lineHeight: 1.08,
        }}
      >
        {plan.symbol} Trade Plan — {fmtDate(plan.date)}
      </div>

      {/* Body row */}
      <div style={{ display: "flex", marginTop: 44, gap: 64, flex: 1 }}>
        {/* Left: magnet + DZ */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1.1 }}>
          <span
            style={{
              fontSize: 18,
              color: MUTED,
              letterSpacing: 3,
              fontWeight: 700,
            }}
          >
            MAGNET
          </span>
          <span
            style={{
              fontFamily: "InterTight",
              fontSize: 84,
              fontWeight: 700,
              color: TEAL,
              marginTop: 4,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            {n(plan.magnet)}
          </span>
          <span
            style={{
              fontSize: 18,
              color: MUTED,
              letterSpacing: 3,
              fontWeight: 700,
              marginTop: 32,
            }}
          >
            DYNAMIC ZONE
          </span>
          <span
            style={{
              fontFamily: "InterTight",
              fontSize: 38,
              fontWeight: 700,
              marginTop: 4,
              letterSpacing: -1,
            }}
          >
            {n(plan.dynamicZoneBottom)} – {n(plan.dynamicZoneTop)}
          </span>
        </div>

        {/* Right: R/S columns */}
        <div style={{ display: "flex", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                color: ROSE,
                fontSize: 16,
                letterSpacing: 3,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              RESISTANCE
            </span>
            {rsRow("R1", plan.r1)}
            {rsRow("R2", plan.r2)}
            {rsRow("R3", plan.r3)}
            {rsRow("R4", plan.r4)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                color: EMERALD,
                fontSize: 16,
                letterSpacing: 3,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              SUPPORT
            </span>
            {rsRow("S1", plan.s1)}
            {rsRow("S2", plan.s2)}
            {rsRow("S3", plan.s3)}
            {rsRow("S4", plan.s4)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 32,
          paddingTop: 22,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <span style={{ color: MUTED, fontSize: 20 }}>tradelevelspro.com</span>
        <span style={{ color: TEAL, fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
          Plan, don't react.
        </span>
      </div>
    </div>
  );
}

function NotFoundCard() {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: BG,
        color: TEXT,
        fontFamily: "Inter",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 6, height: 36, background: TEAL, borderRadius: 3, display: "flex" }} />
        <span style={{ fontFamily: "InterTight", fontSize: 24, letterSpacing: 4, fontWeight: 700 }}>
          TRADE LEVELS PRO
        </span>
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "InterTight",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: -1,
          marginTop: 16,
        }}
      >
        Plan not found
      </div>
      <div style={{ display: "flex", color: MUTED, fontSize: 22 }}>tradelevelspro.com</div>
    </div>
  );
}

export async function renderPlanOgImage(plan: Plan): Promise<ImageResponse> {
  return new ImageResponse(<PlanCard plan={plan} />, {
    width: 1200,
    height: 630,
    fonts: buildFontList(),
  });
}

let notFoundCache: Buffer | null = null;
export async function renderNotFoundOgImage(): Promise<Buffer> {
  if (notFoundCache) return notFoundCache;
  const resp = new ImageResponse(<NotFoundCard />, {
    width: 1200,
    height: 630,
    fonts: buildFontList(),
  });
  const arr = await resp.arrayBuffer();
  notFoundCache = Buffer.from(arr);
  return notFoundCache;
}
