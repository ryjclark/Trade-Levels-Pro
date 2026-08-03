import { Signal, Wifi, BatteryFull } from "lucide-react";

export default function PhonePreview() {
  return (
    <div className="phone-frame phone-float" aria-hidden="true" data-testid="phone-preview">
      <div className="phone-screen">
        <div className="phone-notch" />
        <div className="phone-status">
          <span>9:41</span>
          <span className="phone-status-icons">
            <Signal size={12} strokeWidth={2.5} />
            <Wifi size={12} strokeWidth={2.5} />
            <BatteryFull size={14} strokeWidth={2.5} />
          </span>
        </div>
        <div className="phone-tg-header">
          <div className="phone-tg-avatar">TLP</div>
          <div className="phone-tg-meta">
            <span className="phone-tg-title">Trade Levels Pro</span>
            <span className="phone-tg-sub">@TradeLevelsProBot · Posted 5:12 PM ET</span>
          </div>
        </div>
        <div className="phone-chat">
          <div className="tg-bubble">
            <div className="tg-bubble-title">ES Daily Trade Plan</div>
            <div className="tg-line">
              <span className="tg-label">Bias:</span>{" "}
              <strong>Bullish while price holds the magnet</strong>
            </div>
            <div className="tg-line">
              <span className="tg-label">Magnet:</span>{" "}
              <span className="tg-num">7,496</span>
            </div>
            <div className="tg-line">
              <span className="tg-label">Dynamic Zone:</span>{" "}
              <span className="tg-num">7,475 – 7,517</span>
            </div>
            <div className="tg-line" style={{ marginTop: 4 }}>
              <span className="tg-label">Failed-breakdown longs</span>
            </div>
            <div className="tg-line">
              🥇 <span className="tg-num">7,427</span> reclaim → long toward{" "}
              <span className="tg-num">7,496</span>, then{" "}
              <span className="tg-num">7,517</span>
            </div>
            <div className="tg-line">
              🥈 <span className="tg-num">7,399</span> deeper backup
            </div>
            <div className="tg-line" style={{ marginTop: 4 }}>
              <span className="tg-label">Rejection short</span>
            </div>
            <div className="tg-line">
              🥇 <span className="tg-num">7,517</span> reject and fail → toward magnet
            </div>
            <div className="tg-line" style={{ marginTop: 6 }}>
              <span className="tg-label">Rule:</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.85)" }}>
                Wait for acceptance, then manage level to level
              </span>
            </div>
            <div className="tg-foot">
              <span>5:12 PM</span>
              <span className="tg-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 12 8 17 15 9" />
                  <polyline points="10 17 17 9" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
