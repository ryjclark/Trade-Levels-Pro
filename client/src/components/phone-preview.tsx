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
            <span className="phone-tg-sub">@TradeLevelsProBot · After close</span>
          </div>
        </div>
        <div className="phone-chat">
          <div className="tg-bubble">
            <div className="tg-bubble-title">ES Daily Trade Plan</div>
            <div className="tg-line">
              <span className="tg-label">Bias:</span>{" "}
              <strong>Neutral · upside lean</strong>
            </div>
            <div className="tg-line">
              <span className="tg-label">Magnet:</span>{" "}
              <span className="tg-num">5,872</span>
            </div>
            <div className="tg-line">
              <span className="tg-label">Dynamic Zone:</span>{" "}
              <span className="tg-num">5,864 – 5,880</span>
            </div>
            <div className="tg-line" style={{ marginTop: 4 }}>
              <span className="tg-label">Resistance</span>
            </div>
            <div className="tg-line">
              R1 <span className="tg-num">5,894</span> · R2{" "}
              <span className="tg-num">5,908</span> · R3{" "}
              <span className="tg-num">5,926</span> · R4{" "}
              <span className="tg-num">5,945</span>
            </div>
            <div className="tg-line" style={{ marginTop: 4 }}>
              <span className="tg-label">Support</span>
            </div>
            <div className="tg-line">
              S1 <span className="tg-num">5,856</span> · S2{" "}
              <span className="tg-num">5,840</span> · S3{" "}
              <span className="tg-num">5,821</span> · S4{" "}
              <span className="tg-num">5,802</span>
            </div>
            <div className="tg-line" style={{ marginTop: 6 }}>
              <span className="tg-label">Setup:</span>{" "}
              <span style={{ color: "rgba(255,255,255,0.85)" }}>
                Long failed breakdown of S1
              </span>
            </div>
            <div className="tg-foot">
              <span>9:34 PM</span>
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
