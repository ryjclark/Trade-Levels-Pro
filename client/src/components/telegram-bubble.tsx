// Homepage Telegram preview. Mirrors the real daily drop format exactly
// (server/lib/telegram-format.ts → formatAlgorithmPlan). Numbers are example only.
export default function TelegramBubble() {
  return (
    <div className="tg-standalone">
      <div className="tg-bubble" data-testid="card-tg-bubble">
        <div className="tg-bubble-title">@TradeLevelsProBot · Posted 5:12 PM ET</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          🤖 ES Trade Plan · Example
        </div>
        <div className="tg-line"><span className="tg-label">Bias:</span> <strong>Bullish</strong></div>
        <div className="tg-line"><span className="tg-label">Magnet:</span> <span className="tg-num">7,496</span></div>
        <div className="tg-line"><span className="tg-label">Dynamic Zone:</span> <span className="tg-num">7,475 – 7,517</span></div>
        <div className="tg-line" style={{ marginTop: 6 }}>🟢 <span className="tg-label">Failed-breakdown longs (best first)</span></div>
        <div className="tg-line">🥇 <span className="tg-num">7,427</span> → flush and reclaim, long toward the magnet</div>
        <div className="tg-line">🥈 <span className="tg-num">7,399</span> (backup)</div>
        <div className="tg-line">🥉 <span className="tg-num">7,372</span> (deeper)</div>
        <div className="tg-line" style={{ marginTop: 6 }}>🔴 <span className="tg-label">Rejection shorts (secondary)</span></div>
        <div className="tg-line">🥇 <span className="tg-num">7,517</span> → reject and fail, short toward the magnet</div>
        <div className="tg-line">🥈 <span className="tg-num">7,547</span></div>
        <div className="tg-line" style={{ marginTop: 6, opacity: 0.85 }}>Rule: wait for acceptance, then manage level to level.</div>
        <div className="tg-line" style={{ opacity: 0.6, fontSize: 11 }}>Educational only. Not investment advice.</div>
        <div className="tg-foot">
          <span>5:12 PM</span>
          <span className="tg-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 12 8 17 15 9" />
              <polyline points="10 17 17 9" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
