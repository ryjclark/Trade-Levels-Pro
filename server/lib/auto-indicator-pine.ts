// Native, self-computing TradingView indicator. Unlike the per-day copy-paste
// export, this recomputes the plan ON the user's chart every session, so it
// auto-updates daily with no manual step. It is an APPROXIMATION of the server
// plan: the same math (floor-pivot magnet, ATR dynamic zone, swing shelves, and
// the A+ failed-breakdown long with targets + invalidation) computed from the
// chart's own price rather than pulling the exact stored numbers. Served as text
// at /api/public/auto-indicator.pine so a user pastes it into TradingView once.
export const AUTO_INDICATOR_PINE = `//@version=5
// Trade Levels Pro — Auto (tradelevelspro.com)
// Auto-updating levels: recomputes each regular session on your chart. Add once.
// Approximation of the daily plan (same math, computed locally) — for the exact
// published levels use the daily "copy levels for your chart" export.
indicator("Trade Levels Pro — Auto", "TLP Auto", overlay=true, max_lines_count=60, max_labels_count=60)

// ===== Inputs =====
gS = "Session"
rth = input.session("0930-1600", "Regular session (exchange time)", group=gS)
tzs = input.string("America/New_York", "Session timezone", group=gS)
gD = "Display"
showZone  = input.bool(true, "Magnet + Dynamic Zone", group=gD)
showTrade = input.bool(true, "A+ / targets / invalidation", group=gD)
gT = "Tuning"
atrLen   = input.int(14,    "ATR length (zone width)", minval=2, group=gT)
zoneMult = input.float(0.25,"Zone width x ATR", step=0.05, group=gT)
pivLen   = input.int(8,     "Swing sensitivity (bars each side)", minval=2, group=gT)
lineLen  = input.int(60,    "Line length (bars back)", minval=10, group=gT)

// ===== Prior completed regular session H/L/C =====
inSess = not na(time(timeframe.period, rth, tzs))
var float ch = na
var float cl = na
var float cc = na
var float pH = na
var float pL = na
var float pC = na
if inSess and not inSess[1]
    pH := ch
    pL := cl
    pC := cc
    ch := high
    cl := low
    cc := close
else if inSess
    ch := math.max(ch, high)
    cl := math.min(cl, low)
    cc := close

// ===== Floor pivot magnet + ATR dynamic zone =====
PP = (pH + pL + pC) / 3
magnet = PP
atrD = request.security(syminfo.tickerid, "D", ta.atr(atrLen), lookahead=barmerge.lookahead_off)
dz = zoneMult * atrD
dzHigh = PP + dz
dzLow  = PP - dz
bias = na(PP) ? "-" : pC > PP + dz ? "Bullish" : pC < PP - dz ? "Bearish" : "Neutral"

// ===== Swing shelves (recent reaction highs/lows) =====
ph = ta.pivothigh(pivLen, pivLen)
pl = ta.pivotlow(pivLen, pivLen)
var array<float> hiArr = array.new_float()
var array<float> loArr = array.new_float()
if not na(ph)
    array.unshift(hiArr, ph)
    if array.size(hiArr) > 30
        array.pop(hiArr)
if not na(pl)
    array.unshift(loArr, pl)
    if array.size(loArr) > 30
        array.pop(loArr)

// k-th nearest shelf below / above a reference (0 = nearest).
f_below(a, ref, k) =>
    b = array.new_float()
    if array.size(a) > 0
        for i = 0 to array.size(a) - 1
            v = array.get(a, i)
            if v < ref
                array.push(b, v)
    array.sort(b, order.descending)
    array.size(b) > k ? array.get(b, k) : na
f_above(a, ref, k) =>
    b = array.new_float()
    if array.size(a) > 0
        for i = 0 to array.size(a) - 1
            v = array.get(a, i)
            if v > ref
                array.push(b, v)
    array.sort(b, order.ascending)
    array.size(b) > k ? array.get(b, k) : na

aplus   = na(magnet) ? na : f_below(loArr, magnet, 0)
backup  = na(magnet) ? na : f_below(loArr, magnet, 1)
invalid = na(magnet) ? na : f_below(loArr, magnet, 2)
t1 = na(magnet) ? na : f_above(hiArr, magnet, 0)
t2 = na(magnet) ? na : f_above(hiArr, magnet, 1)
t3 = na(magnet) ? na : f_above(hiArr, magnet, 2)

// ===== Draw (persistent objects updated on the last bar, no duplicates) =====
f_fmt(v) => str.tostring(v, format.mintick)
f_set(ln, lb, p, txt, c, w, dot) =>
    if na(p)
        label.set_text(lb, "")
        line.set_xy1(ln, bar_index, na)
        line.set_xy2(ln, bar_index, na)
    else
        line.set_xy1(ln, bar_index - lineLen, p)
        line.set_xy2(ln, bar_index + 6, p)
        line.set_color(ln, c)
        line.set_width(ln, w)
        line.set_style(ln, dot ? line.style_dotted : line.style_solid)
        label.set_xy(lb, bar_index + 6, p)
        label.set_text(lb, txt + " " + f_fmt(p))
        label.set_color(lb, c)
        label.set_textcolor(lb, color.white)

mkLine() => line.new(na, na, na, na, xloc=xloc.bar_index)
mkLabel() => label.new(na, na, "", xloc=xloc.bar_index, style=label.style_label_left, size=size.small)
var line  lnMag = mkLine()
var label lbMag = mkLabel()
var line  lnZH  = mkLine()
var label lbZH  = mkLabel()
var line  lnZL  = mkLine()
var label lbZL  = mkLabel()
var line  lnA   = mkLine()
var label lbA   = mkLabel()
var line  lnB   = mkLine()
var label lbB   = mkLabel()
var line  lnI   = mkLine()
var label lbI   = mkLabel()
var line  lnT1  = mkLine()
var label lbT1  = mkLabel()
var line  lnT2  = mkLine()
var label lbT2  = mkLabel()
var line  lnT3  = mkLine()
var label lbT3  = mkLabel()

if barstate.islast
    f_set(lnMag, lbMag, showZone ? magnet : na, "◆ Magnet", color.new(color.orange, 0), 2, false)
    f_set(lnZH,  lbZH,  showZone ? dzHigh : na, "DZ high", color.new(color.orange, 45), 1, true)
    f_set(lnZL,  lbZL,  showZone ? dzLow  : na, "DZ low",  color.new(color.orange, 45), 1, true)
    f_set(lnA,   lbA,   showTrade ? aplus   : na, "🎯 A+ LONG",   color.new(color.lime, 0), 3, false)
    f_set(lnB,   lbB,   showTrade ? backup  : na, "Long backup",  color.new(color.green, 25), 1, false)
    f_set(lnI,   lbI,   showTrade ? invalid : na, "✕ Invalid <",  color.new(color.red, 0), 2, true)
    f_set(lnT1,  lbT1,  showTrade ? t1 : na, "T1", color.new(color.aqua, 0), 2, false)
    f_set(lnT2,  lbT2,  showTrade ? t2 : na, "T2", color.new(color.aqua, 20), 1, false)
    f_set(lnT3,  lbT3,  showTrade ? t3 : na, "T3", color.new(color.aqua, 40), 1, false)

var table tb = table.new(position.top_right, 1, 3, border_width=1, frame_color=color.new(color.gray, 50), frame_width=1)
if barstate.islast
    table.cell(tb, 0, 0, "Trade Levels Pro (auto)", text_color=color.white, bgcolor=color.new(color.blue, 10), text_size=size.small)
    table.cell(tb, 0, 1, "Bias: " + bias, text_color=(bias == "Bullish" ? color.lime : bias == "Bearish" ? color.red : color.gray), text_size=size.small)
    table.cell(tb, 0, 2, "tradelevelspro.com", text_color=color.gray, text_size=size.small)
`;
