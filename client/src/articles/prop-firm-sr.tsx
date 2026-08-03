import { MidCta, EndCta } from "@/pages/public-article";

export function ArticlePropFirm() {
  return (
    <>
      <p>
        The drawdown rule kills more prop firm evaluations than bad setups do.
        Most evaluators don't fail because they can't find good trades. They
        fail because they take too many of them, hold them too long, and watch
        a profitable account get clipped by a single 4% afternoon.
      </p>

      <p>
        Level-based trading — specifically the disciplined use of pre-planned
        support, resistance, and Magnet levels — is the highest-leverage
        change a prop firm trader can make. It directly addresses the two
        issues that punish evaluators: over-trading and unbounded drawdown.
      </p>

      <h2>The prop firm reality</h2>
      <p>
        Whether you're at Topstep, Apex, MyFundedFutures, Tradeify, or any of
        the others, the rules look more alike than they look different:
      </p>
      <ul>
        <li>
          <strong>Daily loss limit:</strong> typically 4–6% of account size.
          Hit it once, the day's over. Hit it twice, the evaluation usually is
          too.
        </li>
        <li>
          <strong>Trailing drawdown:</strong> the firm watches your account
          high-water mark and trails a stop behind it (usually 5–10% of
          account size, sometimes EOD-based, sometimes intraday). Touch the
          trail, you're out.
        </li>
        <li>
          <strong>Profit target before either of the above traps you.</strong>
          Usually 6–10% of account size before you get funded.
        </li>
      </ul>
      <p>
        That math is unforgiving. You're being asked to hit a profit target
        roughly equal to your max drawdown — without ever touching the trail.
        The asymmetry is the whole game.
      </p>

      <h2>Why discretionary trading fails the math</h2>
      <p>
        Most discretionary traders blow evaluations the same way. There's a
        pattern:
      </p>
      <p>
        Day 1: take 6 trades, win 4, end the day +1.2%. Feeling good.
      </p>
      <p>
        Day 3: stop out of two trades back-to-back, revenge into a third, take
        a -3% red day. Now you're net flat with one bullet left.
      </p>
      <p>
        Day 5: try to "make it back" before the end of the week, take a setup
        that wasn't really a setup, lose a full daily limit, and your account
        is over.
      </p>
      <p>
        Notice what killed it: not skill, not edge, not market conditions.
        Volume of trades and emotional sizing did. Discretionary trading
        without a written framework allows the trader to take any setup that
        looks good in the moment. That's the killer.
      </p>

      <h2>Why level-based trading fits prop rules</h2>
      <p>
        Pre-planned levels solve the structural problem. Three reasons:
      </p>
      <p>
        <strong>1. Defined risk before the trade exists.</strong> If you know
        your entry, your stop, and your target the night before, the trade
        sizes itself. There's no "let's see what happens." Position size is a
        math output, not a feeling.
      </p>
      <p>
        <strong>2. Pre-planned setups eliminate revenge trades.</strong> If
        the only trades you take are the ones you wrote down at 9 PM the night
        before, you can't take a revenge trade. The setup either triggers or
        it doesn't.
      </p>
      <p>
        <strong>3. Easier to walk away.</strong> When all the day's setups
        have either triggered or been invalidated, the day is mathematically
        over. You're not staring at the chart looking for one more thing.
      </p>
      <blockquote>
        Prop firm evaluations reward traders who can do nothing for hours.
        Level-based trading gives you permission to.
      </blockquote>

      <h2>The four ES levels every prop trader should know each day</h2>
      <p>
        You don't need 15 lines on your chart. You need four numbers. Internalize
        them, write them down, and let everything else fade.
      </p>
      <h3>1. The Magnet</h3>
      <p>
        The center of gravity for the session. The Magnet tells you where price
        is most likely to revisit. For a prop trader, the Magnet is your
        anchor — most days, ES will trade through it more than once.
      </p>
      <h3>2. The Dynamic Zone (DZ)</h3>
      <p>
        The reactive band around the Magnet where price tends to consolidate or
        reverse. The DZ defines your "no trade" middle ground. If price is in
        the DZ and not at an edge, you're not trading.
      </p>
      <h3>3. R1 / S1 — the first ladder rung</h3>
      <p>
        The first level above and below the Dynamic Zone. R1 and S1 are your
        most-likely scalp targets and your most-likely first reaction zones.
        These are the bread-and-butter trades for a prop evaluation: small,
        defined, repeatable.
      </p>
      <h3>4. R4 / S4 — the outer rung</h3>
      <p>
        The outermost level of your daily range. R4 and S4 are the "session
        extreme" levels — touched on real trend days, ignored on most others.
        These are also where you cover, not where you initiate. A prop trader
        who chases R4 is asking to be trailed out.
      </p>
      <p>
        Four numbers. That's the entire chart. Everything else is noise.
      </p>

      <MidCta />

      <h2>A hypothetical $50K evaluation day</h2>
      <p>
        Imagine you're on a $50K Topstep account. Daily loss limit:
        $1,200. Trailing drawdown: $2,500. Profit target: $3,000. The plan for
        the day looks like this:
      </p>
      <ul>
        <li>Magnet: <code>5,818</code></li>
        <li>Dynamic Zone: <code>5,812 – 5,824</code></li>
        <li>R1: <code>5,832</code> · R2: <code>5,847</code> · R3: <code>5,861</code> · R4: <code>5,878</code></li>
        <li>S1: <code>5,804</code> · S2: <code>5,790</code> · S3: <code>5,776</code> · S4: <code>5,761</code></li>
        <li>Bias: bullish above the Magnet.</li>
      </ul>
      <p>
        ES opens at <code>5,820</code> — inside the DZ. You don't trade. Price
        drifts down to S1 at <code>5,804</code>, prints a wick, and forms a
        5-minute reversal. That's setup #1: long S1 reaction toward the
        Magnet. Entry <code>5,806</code>, stop <code>5,799</code> (just below
        S1), first target <code>5,818</code> (Magnet), runner to{" "}
        <code>5,832</code> (R1).
      </p>
      <p>
        Risk: 7 ticks × 4 contracts = $350. Well under the daily loss limit
        and well under the trailing drawdown. You take partial at the Magnet,
        runner stops out at break-even after R1 prints. Trade nets ~$650.
      </p>
      <p>
        ES then ranges between R1 and the Magnet for two hours. You don't
        trade. Setup #2 was a short rejection at R2 — that level never
        prints. The day is mathematically over for you. You're up ~$650, took
        one trade, and the trail moved with you. <em>That</em> is what passing
        an evaluation looks like.
      </p>

      <h2>Common prop firm mistakes</h2>
      <ul>
        <li>
          <strong>Trading the open without a level.</strong> The first 15
          minutes is when most evaluators bleed. If price isn't at one of your
          numbers, you have no edge.
        </li>
        <li>
          <strong>Trading every direction.</strong> If your bias is bullish
          and you take a counter-trend short into S1, size it like the
          contrarian trade it is — 25% of normal size, not 100%.
        </li>
        <li>
          <strong>Holding for "the next level" without scaling.</strong> R1
          becomes R2 becomes R3 becomes a full reversal back through R1.
          Without scaling, your winners turn into stops.
        </li>
        <li>
          <strong>Adding to losers.</strong> If your stop is at S2 and price
          is at S1.5, you do not add. You wait for the level or you take the
          stop.
        </li>
        <li>
          <strong>Trading after a daily limit hit.</strong> Most firms forbid
          it. Most traders do it anyway. It is the single fastest way to fail
          an evaluation.
        </li>
      </ul>

      <h2>How a daily plan compounds your evaluation</h2>
      <p>
        On any single day, a written plan saves you maybe one bad trade. Over a
        20-day evaluation, that's 20 fewer bad trades. The math compounds
        ferociously: a trader who takes 1 fewer revenge trade per day, over a
        month, has a fundamentally different drawdown profile than one who
        doesn't.
      </p>
      <p>
        That's the unglamorous truth about prop firms. You don't pass them by
        finding more trades. You pass them by taking fewer, better ones.
      </p>

      <h2>Position sizing math for prop accounts</h2>
      <p>
        Most evaluators get sizing wrong in a specific way: they size to the
        target instead of sizing to the stop. On a $50K Topstep account with a
        $1,200 daily loss limit, the correct math is to risk no more than
        20–25% of the daily loss limit on any single trade. That's $240–$300
        per trade, and it has to include slippage and commissions.
      </p>
      <p>
        On ES, one tick is $12.50, so one full point is $50. A 7-tick stop
        ($87.50) at four contracts is $350 of risk — already over the
        25% threshold. Either trim to three contracts ($262.50) or tighten the
        stop to 5 ticks ($250 at four contracts). The stop is not a feeling.
        It's a math output.
      </p>
      <p>
        The same logic applies to scaling out. A first partial at the Magnet
        on a long from S1 should cover at least the original risk. If you
        risked $300, scale enough at the Magnet to lock in $300+ as
        realized P&amp;L. The runner is then a free lottery ticket on R1 or R2
        — it cannot turn a winning day into a losing one because your scaled
        portion already paid for the trade.
      </p>

      <h2>The two-trade rule</h2>
      <p>
        The single most useful rule a prop evaluator can adopt is the
        <em> two-trade rule</em>: at most two trades per day, full stop. If both
        win, you're done. If one wins and one loses, you're done. If both
        lose, you're absolutely done.
      </p>
      <p>
        This rule sounds restrictive. It is not. The math says otherwise:
        most professional ES traders take 1–3 trades per session. The
        difference between a profitable evaluator and a failing one is rarely
        the quality of trade #1 or #2 — it's the existence of trades #5, #6,
        and #7, which are almost always emotional.
      </p>
      <p>
        Two trades. Pre-planned. Pre-sized. After the second decision is made,
        close the platform.
      </p>

      <h2>How trailing drawdown actually works (and why it punishes scalpers)</h2>
      <p>
        Trailing drawdown is the rule that catches out the most scalpers. The
        firm tracks your account's high-water mark and trails a stop behind
        it. On a $50K account with a $2,500 trail, if you reach $52,000 of
        equity, your effective floor is now $49,500. Touch $49,500 and you're
        out — even though you started at $50,000.
      </p>
      <p>
        Scalpers get caught here because their equity curve oscillates. They
        reach $52,000 intraday on a winning trade, give back to $50,500 on the
        next, and then take a $1,200 daily loss limit. Equity is now $49,300
        — below the trail. Evaluation over.
      </p>
      <p>
        Level-based traders get caught less often because their equity curve
        is "lumpier." One or two solid trades, then nothing. Less round-trip
        of equity through the day means less exposure to the trail. This is
        another reason structure beats hyperactivity for prop evaluations.
      </p>

      <h2>Daily journal: the underrated edge</h2>
      <p>
        Every prop evaluator who passes consistently keeps a journal. It does
        not have to be elaborate. Five fields per day are enough:
      </p>
      <ul>
        <li><strong>Plan:</strong> the four levels and bias from last night.</li>
        <li><strong>Setups taken:</strong> which of the two pre-planned setups triggered, and what was the outcome.</li>
        <li><strong>Setups skipped:</strong> any planned setup that didn't trigger and why.</li>
        <li><strong>Off-plan trades:</strong> any trade that wasn't on the plan. (Goal: zero.)</li>
        <li><strong>End of day equity and trail distance:</strong> where you sit relative to the rules.</li>
      </ul>
      <p>
        Twenty days of this and you'll see your own patterns clearly. Most
        traders are shocked to find that a large share of their losing days come
        from off-plan trades. The journal is the diagnostic: it tells you exactly
        which behavior is killing the account.
      </p>

      <h2>Resetting after a red day</h2>
      <p>
        Even with a perfect process, you'll have red days. The single
        difference between traders who recover and traders who blow accounts
        is what they do the morning after.
      </p>
      <p>
        The right answer is boring: write the next day's plan exactly the same
        way, take exactly the same setups, and size exactly the same as
        before. The wrong answer is to "make it back" — increased size,
        loosened criteria, or extra trades to chase the prior day's loss.
        That's how a $1,200 red day becomes a $3,200 red day and a failed
        evaluation by the end of the week.
      </p>
      <p>
        If the red day was caused by good trades that didn't work, change
        nothing. If it was caused by off-plan behavior, the red day is a
        signal to tighten — fewer setups, smaller size, longer pre-trade
        confirmation — until the off-plan trades stop.
      </p>

      <h2>Picking the right firm for level-based trading</h2>
      <p>
        Not every prop firm is equally suited to disciplined, level-based ES
        trading. The variables that matter most:
      </p>
      <ul>
        <li>
          <strong>Trailing drawdown structure.</strong> EOD-only trails are
          much friendlier to level-based traders than intraday trails. If
          available, prefer EOD.
        </li>
        <li>
          <strong>News-trading restrictions.</strong> Some firms restrict
          trading around major economic releases. For most level-based ES
          traders this is a non-issue (you're standing aside through CPI
          anyway), but check the rules.
        </li>
        <li>
          <strong>Consistency rules.</strong> Some firms require no single day
          to exceed X% of total profit. This favors slow, consistent
          accumulation — exactly what level-based trading produces.
        </li>
        <li>
          <strong>Scale-up plans.</strong> Once funded, can you grow into
          larger account sizes? This matters more than the discount on the
          evaluation fee.
        </li>
      </ul>
      <p>
        The cheapest evaluation isn't always the best fit. A slightly more
        expensive challenge with EOD trail and clear scale-up math will
        usually produce a better long-term outcome than the latest 80%-off
        promo on a firm with intraday-trail mechanics.
      </p>

      <h2>What to do tomorrow</h2>
      <p>
        Pick a $50K evaluation. Define your four numbers tonight: Magnet, DZ,
        R1/S1, R4/S4. Pre-write your two setups. Tomorrow, take only those
        setups. Walk away when both have triggered or invalidated. Repeat for
        20 days.
      </p>
      <p>
        That's the playbook. It's boring. It works.
      </p>

      <EndCta />
    </>
  );
}
