export default function TelegramBubble() {
  return (
    <div className="tg-standalone">
      <div className="tg-bubble" data-testid="card-tg-bubble">
        <div className="tg-bubble-title">@TradeLevelsProBot · After close</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          ES Daily Trade Plan — Sample
        </div>
        <div className="tg-line"><span className="tg-label">Bias:</span> <strong>Bullish above magnet</strong></div>
        <div className="tg-line"><span className="tg-label">Magnet:</span> <span className="tg-num">5,872</span></div>
        <div className="tg-line"><span className="tg-label">Dynamic Zone:</span> <span className="tg-num">5,864 – 5,880</span></div>
        <div className="tg-line" style={{ marginTop: 6 }}><span className="tg-label">Resistance:</span></div>
        <div className="tg-line">R1 <span className="tg-num">5,887</span> │ R2 <span className="tg-num">5,901</span> │ R3 <span className="tg-num">5,918</span> │ R4 <span className="tg-num">5,932</span></div>
        <div className="tg-line" style={{ marginTop: 6 }}><span className="tg-label">Support:</span></div>
        <div className="tg-line">S1 <span className="tg-num">5,856</span> │ S2 <span className="tg-num">5,841</span> │ S3 <span className="tg-num">5,824</span> │ S4 <span className="tg-num">5,808</span></div>
        <div className="tg-foot">
          <span>9:34 PM</span>
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
