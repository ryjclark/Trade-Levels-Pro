export default function TelegramBubble() {
  return (
    <div className="tg-standalone">
      <div className="tg-bubble" data-testid="card-tg-bubble">
        <div className="tg-bubble-title">@TradeLevelsProBot · Posted 5:12 PM ET</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          ES Daily Trade Plan — Sample
        </div>
        <div className="tg-line"><span className="tg-label">Bias:</span> <strong>Bullish while price holds the magnet</strong></div>
        <div className="tg-line"><span className="tg-label">Magnet:</span> <span className="tg-num">7,496</span></div>
        <div className="tg-line"><span className="tg-label">Dynamic Zone:</span> <span className="tg-num">7,475 – 7,517</span></div>
        <div className="tg-line" style={{ marginTop: 6 }}><span className="tg-label">Failed-breakdown longs:</span></div>
        <div className="tg-line">🥇 <span className="tg-num">7,427</span> reclaim → long toward <span className="tg-num">7,496</span>, then <span className="tg-num">7,517</span></div>
        <div className="tg-line">🥈 <span className="tg-num">7,399</span> deeper backup if the first fails</div>
        <div className="tg-line" style={{ marginTop: 6 }}><span className="tg-label">Rejection short:</span></div>
        <div className="tg-line">🥇 <span className="tg-num">7,517</span> reject and fail to hold → toward magnet</div>
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
