import { MidCta, EndCta } from "@/pages/public-article";

export function ArticleDailyTemplate() {
  return (
    <>
      <p>
        If you can't write your plan on an index card, you don't have a plan.
        You have a feeling.
      </p>

      <p>
        Every evening I sit down with the day's chart, the prior session's
        volume, and a blank template. Twenty minutes later, I have a written
        ES plan with five sections and a maximum of two setups. That document
        is my entire job for the next trading session. If it triggers, I
        execute it. If it doesn't, I do nothing.
      </p>

      <p>
        This is the exact template. Steal it.
      </p>

      <h2>What a daily plan is — and isn't</h2>
      <p>
        A daily plan is a written, pre-committed framework for the next ES
        session. It tells you the levels, the bias, and the specific setups
        you'll be looking for. It does not tell you what's going to happen. It
        tells you what you'll do <em>if</em> certain things happen.
      </p>
      <p>
        A daily plan is <em>not</em> a prediction. It's not a directional bet.
        It's not a guess about the open. It's a structured response to a few
        possible scenarios — written down before you have any emotional skin
        in the game.
      </p>
      <blockquote>
        The point of writing the plan is to make all your hard decisions when
        you're calm, so the only decision left at 9:30 AM is "did the trigger
        fire — yes or no."
      </blockquote>

      <h2>The 5-section template</h2>

      <h3>Section 1: Magnet</h3>
      <p>
        One number. The price ES is most likely to gravitate toward intraday.
        Found from the prior session's point of control, untested levels, gap
        fills, or the centerline of repeated rejection. If you can't pick one
        Magnet, you don't have enough conviction in the structure — go back to
        the chart.
      </p>
      <p>
        Write it as: <code>Magnet: 5,818</code>. That's it.
      </p>

      <h3>Section 2: Dynamic Zone (DZ)</h3>
      <p>
        A range, usually 8–16 ES points wide, centered roughly on the Magnet.
        This is the reactive band where price tends to consolidate, reverse,
        or re-test. It's also your "no trade" zone — if price is mid-DZ and
        not at an edge, you're not trading.
      </p>
      <p>
        Write it as: <code>DZ: 5,812 – 5,824</code>.
      </p>

      <h3>Section 3: S/R ladder</h3>
      <p>
        Four levels above the DZ, four levels below. R1 and S1 are the rungs
        immediately outside the DZ. R4 and S4 are session-extreme levels —
        rarely touched, but useful when they are.
      </p>
      <ul>
        <li>R1, R2, R3, R4 — derived from prior swings, key options strikes, or session highs.</li>
        <li>S1, S2, S3, S4 — symmetric: prior lows, untested support, fresh gaps.</li>
      </ul>
      <p>
        These levels are not equal. The inner rungs (R1 and S1) get tagged far
        more often than the outer ones (R4 and S4), which only come into play on
        the biggest range days. Plan accordingly.
      </p>

      <h3>Section 4: Bias</h3>
      <p>
        One sentence. Direction-conditional on a level. Examples:
      </p>
      <ul>
        <li><strong>Bullish above the Magnet.</strong></li>
        <li><strong>Bearish below S1.</strong></li>
        <li><strong>Two-sided inside the DZ.</strong></li>
      </ul>
      <p>
        The bias is conditional. It's not "I think it goes up." It's "if price
        is above X, I'm a buyer at the dips, and if it's below Y, I'm a seller
        at the rallies." The condition <em>is</em> the bias.
      </p>

      <h3>Section 5: One or two setups</h3>
      <p>
        Specific. Pre-defined. Each setup has an entry, a stop, and a first
        target. Two is the maximum. If you have three, prioritize and cut one.
      </p>
      <p>Example setup 1:</p>
      <ul>
        <li><strong>Type:</strong> Long S1 reaction toward Magnet.</li>
        <li><strong>Entry:</strong> 5,806 on confirmation (5-min reversal candle).</li>
        <li><strong>Stop:</strong> 5,799 (below S1).</li>
        <li><strong>First target:</strong> 5,818 (Magnet). Runner: 5,832 (R1).</li>
      </ul>
      <p>Example setup 2:</p>
      <ul>
        <li><strong>Type:</strong> Short R2 rejection if price overextends.</li>
        <li><strong>Entry:</strong> 5,847 on rejection wick.</li>
        <li><strong>Stop:</strong> 5,855 (above R3 line).</li>
        <li><strong>First target:</strong> 5,832 (R1). Runner: Magnet.</li>
      </ul>

      <MidCta />

      <h2>How to write the plan in under 20 minutes</h2>
      <p>
        Speed matters. If the plan takes 90 minutes every night, you'll skip
        nights, and a half-skipped plan is worse than no plan. The 20-minute
        version:
      </p>
      <ol>
        <li>
          <strong>Minutes 0–4: structure scan.</strong> Pull up the daily
          chart. Mark the prior session's high, low, and close. Note where
          price is relative to the prior week's range.
        </li>
        <li>
          <strong>Minutes 4–8: Magnet + DZ.</strong> Drop to the 30-minute
          chart. Find the level price has revisited most. That's your Magnet.
          Bracket it ±6–8 points for the DZ.
        </li>
        <li>
          <strong>Minutes 8–14: ladder.</strong> Mark R1, R2, R3, R4 above the
          DZ from prior swing highs and untested levels. Mirror for support.
        </li>
        <li>
          <strong>Minutes 14–17: bias.</strong> Look at the broader trend on
          the daily and 4-hour. Write one conditional sentence.
        </li>
        <li>
          <strong>Minutes 17–20: setups.</strong> What's the cleanest reaction
          trade? What's the cleanest rejection trade? Write both.
        </li>
      </ol>
      <p>
        Stop. Save the plan. Walk away. Don't look at it again until the next
        morning.
      </p>

      <h2>A worked example using the May 12 sample</h2>
      <p>
        Using the numbers from our published <a href="/sample">sample plan</a>:
      </p>
      <ul>
        <li>Magnet: <code>5,818</code></li>
        <li>DZ: <code>5,812 – 5,824</code></li>
        <li>R1 <code>5,832</code> · R2 <code>5,847</code> · R3 <code>5,861</code> · R4 <code>5,878</code></li>
        <li>S1 <code>5,804</code> · S2 <code>5,790</code> · S3 <code>5,776</code> · S4 <code>5,761</code></li>
        <li>Bias: bullish above the Magnet.</li>
        <li>
          Setup 1: long S1 reaction targeting Magnet, stop below S2.
        </li>
        <li>
          Setup 2: short R2 rejection if price overextends, stop above R3.
        </li>
      </ul>
      <p>
        That's a complete plan. Five sections, two setups, one bias.
        Everything you need to trade tomorrow's session is in those nine
        lines.
      </p>

      <h2>How to use the plan the next day</h2>
      <p>
        At the open, you do three things:
      </p>
      <ol>
        <li>
          <strong>Mark the levels on your chart.</strong> All eight S/R rungs,
          the Magnet, and the DZ as a colored rectangle.
        </li>
        <li>
          <strong>Read the bias to yourself out loud.</strong> Once. That's
          the only direction filter you're allowed for the day.
        </li>
        <li>
          <strong>Wait.</strong> Watch the open settle. Do not take a trade
          unless price is at one of your levels and the setup conditions are
          met.
        </li>
      </ol>
      <p>
        If neither setup triggers in the first two hours, ask: is the bias
        still valid? If yes, keep waiting. If no, the day is over. Close the
        platform.
      </p>

      <h2>Rules for stepping aside when the plan is invalidated</h2>
      <p>
        A plan is invalidated when one of three things happens:
      </p>
      <ul>
        <li>
          <strong>Bias breaks.</strong> Price closes a 30-minute candle on the
          wrong side of the conditional level (e.g. closes below the Magnet
          when bias was bullish above it).
        </li>
        <li>
          <strong>Both setups stop out.</strong> If both pre-planned trades
          have been taken and stopped, you're done. No "third setup."
        </li>
        <li>
          <strong>Range is too tight.</strong> Price never reaches a level. No
          trade fires. Day ends. That's a successful no-trade day.
        </li>
      </ul>
      <p>
        Stepping aside is the trade. It's just one nobody recognizes.
      </p>

      <h2>Common mistakes when writing the plan</h2>
      <p>
        Five mistakes new planners make over and over. All of them are
        avoidable.
      </p>
      <p>
        <strong>1. Too many setups.</strong> A plan with five setups is a
        wishlist, not a plan. The point of the template is to force prioritization.
        If you can't choose between three setups, your conviction in all of them
        is too low. Pick two.
      </p>
      <p>
        <strong>2. Vague entries.</strong> "Long around 5,800" is not an entry.
        "Long 5,806 on 5-minute reversal candle close above 5,808" is. Specificity
        is what protects you from emotional execution.
      </p>
      <p>
        <strong>3. Stops behind two levels.</strong> "Stop below S2" when your
        entry is at S1 means you're risking the whole rung. Most level trades
        should risk to the next obvious invalidation, not to the next major
        level. If S1 is your entry level, your stop usually belongs just below
        S1 — not S2.
      </p>
      <p>
        <strong>4. Targets at the next level only.</strong> Just because R1 is
        the first target doesn't mean you must exit there. The point of the
        ladder is to scale. Take a partial at R1, hold a runner toward R2 with
        a trailed stop. Single-target trades leave most of the edge on the table.
      </p>
      <p>
        <strong>5. Editing the plan during the session.</strong> Once the bell
        rings, the plan is locked. If a "better" setup appears at 10:45 AM that
        wasn't in the plan, you don't take it. You write it down, study it
        tonight, and decide tomorrow whether it should be in the next plan.
      </p>

      <h2>What to do when the plan doesn't trigger</h2>
      <p>
        On many days, neither of your setups will fire, and sitting out is the
        correct play. ES will spend the day inside the Dynamic Zone, never
        reaching S1 or R1, and the trade you planned just doesn't appear. New
        traders treat this as failure. It's not. It's the plan working.
      </p>
      <p>
        A no-trade day is a passing day. You preserved capital, preserved
        focus, and didn't get pulled into mediocre setups. In a 20-session
        evaluation, six no-trade days plus 14 days with one or two clean
        trades is exactly the equity curve that gets people funded.
      </p>
      <p>
        The discipline to do nothing on a no-trade day is the same discipline
        that lets you stay flat at lunch and walk away after a stop-out. It's
        the same skill, applied at different timescales.
      </p>

      <h2>Building the weekly review</h2>
      <p>
        Once a week, set aside 30 minutes to review the past five plans against
        what actually happened. Three questions:
      </p>
      <ul>
        <li>
          <strong>Were the levels accurate?</strong> Did price actually react
          at the levels you marked, or did it ignore them? If your S1 hasn't
          held in three weeks, your S1 methodology is off.
        </li>
        <li>
          <strong>Was the bias accurate?</strong> Did price respect the
          bias-defining level (Magnet, S1, etc.)? If you've been bullish all
          week and price keeps closing below the Magnet, the bias framework
          needs adjustment.
        </li>
        <li>
          <strong>Were the setups taken correctly?</strong> Of the setups that
          triggered, did you execute them as written? Of the ones that didn't,
          were they really invalidated, or did you skip a valid setup?
        </li>
      </ul>
      <p>
        Weekly review compounds the power of the daily template. It's how the
        template gets sharper over months. Without review, the template is
        static. With review, it evolves with the market.
      </p>

      <h2>Adapting the template for different market regimes</h2>
      <p>
        The template works in every market regime — but the parameters shift.
        Three regimes worth knowing:
      </p>
      <p>
        <strong>Low volatility (compressed range).</strong> Tighten the
        Dynamic Zone (4–8 points instead of 8–16). Reduce the spacing between
        ladder rungs. Expect smaller wins per trade. Two scalp-grade setups
        beat one swing setup in this regime.
      </p>
      <p>
        <strong>High volatility (expansion / breakout days).</strong> Widen
        the Dynamic Zone (12–20 points). Spread ladder rungs further apart.
        Bias becomes more important — trade direction matters more than entry
        precision. Cut size if VIX spikes mid-session because slippage
        increases.
      </p>
      <p>
        <strong>Mixed regime (chop with brief trend bursts).</strong> The
        hardest regime to trade and the easiest to over-trade. Be more strict
        about confirmation, take smaller size, and lean on the no-trade day
        more often. The template still works; you just take fewer trades.
      </p>

      <h2>The plan is a tool for becoming the trader you want to be</h2>
      <p>
        The deeper benefit of the template isn't any single day's P&amp;L. It's
        what writing a plan every night does to you as a trader over months.
      </p>
      <p>
        You stop thinking about the market in terms of opinions and start
        thinking about it in terms of conditions. You stop saying "I think ES
        is going up" and start saying "ES is bullish above 5,818, bearish
        below it, and not tradable in between." That shift — from prediction
        to conditional response — is the same shift that separates discretionary
        amateurs from systematic professionals.
      </p>
      <p>
        The template is the daily ritual that builds the muscle. Twenty
        minutes a night. Five sections. Two setups. Repeat for a year and the
        market looks different.
      </p>

      <h2>Why this works</h2>
      <p>
        Every part of the template is designed to take a decision out of the
        moment. The Magnet decides where you focus. The DZ decides where you
        don't trade. The ladder decides where you scale. The bias decides
        which side. The setups decide the trigger.
      </p>
      <p>
        By 9:30 AM, your job is reduced to: did the trigger fire? Yes? Take
        it. No? Don't.
      </p>
      <p>
        That's the entire game.
      </p>

      <EndCta />
    </>
  );
}
