import { MidCta, EndCta } from "@/pages/public-article";

export function ArticleMagnet() {
  return (
    <>
      <p>
        If you've watched ES claw its way back to the same number three times in
        a session — even after a clean breakout, even after a strong reversal —
        you've already seen a Magnet level. You just didn't have a name for it.
      </p>

      <p>
        Magnet levels are one of the most useful tools an intraday futures
        trader can have on the chart, and one of the most misused. Most traders
        either ignore them, or they treat them like a brick wall that's
        guaranteed to hold or break. Both are wrong, and both lose money.
      </p>

      <p>
        This post is the version of the conversation I wish I'd had years ago:
        what a Magnet actually is, why price gravitates to it, how it's
        identified the night before, and the three honest ways to trade it
        without getting trapped.
      </p>

      <h2>What a Magnet level actually is</h2>
      <p>
        A Magnet level is a specific price in ES that the market tends to
        gravitate toward intraday. It's not a target. It's not a prediction.
        It's a price the order book "wants" to revisit because of where size
        traded, where stops sit, or where untested liquidity rests.
      </p>
      <p>
        On a chart, you can usually identify it after the fact: price keeps
        coming back to the same number. It rejects, then comes back. It breaks,
        then reclaims. It rallies away, then drifts back. Even though it's not
        the high or the low of the day, it ends up being the center of gravity
        for the entire session.
      </p>
      <blockquote>
        A Magnet is gravity, not a wall. Price is pulled to it. What happens
        when it gets there is a separate question — and that's where the trade
        is.
      </blockquote>

      <h2>How a Magnet differs from VWAP, value area, and pivots</h2>
      <p>
        These all sound similar. They're not.
      </p>
      <ul>
        <li>
          <strong>VWAP</strong> is a moving average of volume-weighted price
          for the current session. It tells you where the average participant
          is positioned, but it moves throughout the day. A Magnet is a single
          static price you defined the night before.
        </li>
        <li>
          <strong>Value area high / low</strong> from the prior session profile
          marks where most volume traded. A Magnet often <em>sits inside</em>
          the value area, but it's a more specific point — usually the precise
          number with the highest concentration of unfinished business.
        </li>
        <li>
          <strong>Floor pivots</strong> are the anchor. Our Magnet starts from
          the session pivot (calculated from the prior day's high, low, and
          close) and is then read in the context of where price actually
          reacted, so you treat it as a gravity level rather than a mechanical
          line.
        </li>
      </ul>
      <p>
        Magnets work because they reflect <em>where price has unresolved
        business</em>. VWAP reflects participation. Value area reflects volume.
        Pivots reflect math. The Magnet reflects intent.
      </p>

      <h2>Why price gravitates to a Magnet</h2>
      <p>
        Three structural reasons price keeps getting pulled back to a specific
        level:
      </p>
      <p>
        <strong>1. Auction theory.</strong> Markets are continuous double
        auctions. When price moves away from a level too fast, the auction is
        considered "incomplete" — there's volume that wanted to trade there but
        didn't. Markets tend to revisit incomplete auctions to fill them in.
      </p>
      <p>
        <strong>2. Institutional flow.</strong> Real size — pension funds,
        index rebalancers, options dealers — works orders patiently around
        specific prints. When ES trades through a level where institutions are
        hedging gamma or executing programs, that price acts like a tractor
        beam for the rest of the day.
      </p>
      <p>
        <strong>3. Liquidity pockets.</strong> Stop runs, breakout failures,
        and gap fills all create resting liquidity above and below specific
        prices. The market is incentivized to sweep that liquidity. Magnets
        often sit just above or below those pockets.
      </p>

      <h2>How a Magnet is identified the night before</h2>
      <p>
        You don't need a Bloomberg terminal to find a Magnet. Most of the work
        comes from looking at the prior session with discipline:
      </p>
      <ul>
        <li>
          <strong>Volume profile.</strong> Where did most of the prior session's
          volume trade? The point of control (POC) is often a Magnet candidate
          for the next day.
        </li>
        <li>
          <strong>Prior session structure.</strong> What level did price reject
          or accept multiple times? Repeated tests usually mark a key Magnet
          for the upcoming session.
        </li>
        <li>
          <strong>Gap fills.</strong> Open gaps from the prior session or week
          act as Magnets — price has a strong tendency to come back and fill
          them.
        </li>
        <li>
          <strong>Untested levels.</strong> A failed breakout from yesterday
          that never got tested in the other direction often becomes the
          Magnet for today.
        </li>
      </ul>
      <p>
        You're looking for a price where the market <em>didn't finish what it
        started</em>. That's your Magnet.
      </p>

      <MidCta />

      <h2>Three honest ways to trade a Magnet</h2>
      <p>
        Once you've identified the Magnet for the day, you have three primary
        structures. Pick the one that fits the price action — don't force it.
      </p>

      <h3>1. Failed move back to the Magnet</h3>
      <p>
        Price tries to break out away from the Magnet, fails, and gets sucked
        back. This is one of the cleanest setups in ES. You're not predicting
        the failure — you're reacting to it. The breakout fails, momentum
        flips, and the Magnet becomes a high-conviction target.
      </p>
      <p>
        Entry: on confirmation of the failure (rejection candle, lower-high or
        higher-low). Stop: just beyond the failed breakout extreme. Target:
        the Magnet, with a partial scale on first touch.
      </p>

      <h3>2. Magnet rejection on first touch</h3>
      <p>
        Price comes into the Magnet for the first time after a strong directional
        move. The Magnet has been "respected" repeatedly in prior sessions, and
        the broader bias is against the move into it. Setup: short or long the
        rejection. Risk: tight, just on the other side of the Magnet.
      </p>
      <p>
        This works best when the Magnet aligns with your daily bias. Trading
        first-touch rejections <em>against</em> a strong bias is a coin flip.
      </p>

      <h3>3. Magnet break with continuation</h3>
      <p>
        Price decisively breaks the Magnet, usually after multiple tests, and
        confirms with momentum on the other side. This is the trend day setup.
        The break of the Magnet is the trigger. The retest is the entry. The
        next reaction level in the direction of the break is the target.
      </p>
      <p>
        The key word is <em>decisively</em>. A wick through the Magnet is not a
        break. A close, a hold, and a return to retest is.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Chasing without confirmation.</strong> Just because price is
          near the Magnet doesn't mean it's a trade. Wait for the structure to
          confirm.
        </li>
        <li>
          <strong>Treating it as a wall, not a gravity well.</strong> Magnets
          can break. The trade is not "the Magnet will hold" — the trade is
          "if this Magnet rejects, here's my structure."
        </li>
        <li>
          <strong>Ignoring the bias.</strong> A Magnet trade against your daily
          bias is a counter-trend trade. That's fine — but size it like one.
        </li>
        <li>
          <strong>Using too many Magnets.</strong> One Magnet per session.
          Maybe two. If you have five "Magnets," you have zero.
        </li>
      </ul>

      <h2>How a Magnet fits inside a daily plan</h2>
      <p>
        The Magnet is not a standalone signal. It lives inside a structured
        daily plan with a Dynamic Zone, ranked reaction levels, and a
        directional bias. The Magnet tells you <em>where</em>. The bias tells
        you <em>which side</em>. The reaction levels tell you <em>where to scale
        or cover</em>.
      </p>
      <p>
        On a typical bullish day, ES might open above the Magnet, drift back to
        test it, get bought aggressively, and rally to the next reaction level.
        The Magnet was your entry zone. The bias was your green light. The
        reaction levels were your targets.
      </p>

      <h2>A hypothetical worked example</h2>
      <p>
        Imagine the daily plan is published with Magnet <code>7,496</code>,
        Dynamic Zone <code>7,475 – 7,517</code>, a reaction level above at{" "}
        <code>7,517</code>, one below at <code>7,468</code>, and a bullish bias
        above the Magnet.
      </p>
      <p>
        ES opens at <code>7,508</code>, rallies briefly, then drifts back into
        the Dynamic Zone. It tags <code>7,496</code> exactly, prints a wick,
        and starts forming higher lows on the 5-minute chart. That is the
        Magnet holding, aligned with bias. Entry around{" "}
        <code>7,499</code>, stop below <code>7,489</code>, first target{" "}
        <code>7,517</code>, runner toward the next reaction level above.
      </p>
      <p>
        The trade isn't right because you predicted price would hold. It's
        right because the Magnet did its job, and you had a pre-defined
        structure ready to react.
      </p>

      <h2>Reading the Magnet's behavior in real time</h2>
      <p>
        Once price reaches your Magnet, the next 15–30 minutes tell you almost
        everything you need to know about the rest of the day. There are four
        common reactions, and learning to spot them quickly is what separates
        traders who use Magnets well from traders who get chopped up by them.
      </p>
      <p>
        <strong>Quick rejection.</strong> Price tags the Magnet, prints a
        single rejection candle, and trades back away with momentum. This is
        the cleanest signal — it tells you the Magnet is acting as the
        boundary the market wants to respect today. Bias trades from this
        rejection are typically the highest-quality opportunities of the
        session.
      </p>
      <p>
        <strong>Acceptance and consolidation.</strong> Price reaches the
        Magnet and just sits on it. The market is digesting. This is a "do
        nothing" signal. Wait for the consolidation to break in one direction
        and use the Magnet as your line in the sand from there.
      </p>
      <p>
        <strong>Whipsaw through.</strong> Price wicks above and below the
        Magnet several times in tight ranges. This is often a sign the broader
        bias is unclear. Reduce size or stand aside; whipsaw conditions are
        where over-trading happens.
      </p>
      <p>
        <strong>Decisive break with retest.</strong> Price punches through the
        Magnet, holds 5–10 points above (or below), comes back to retest, and
        confirms. This is a trend-day setup and the Magnet flips polarity —
        what was the center of gravity becomes the new support or resistance
        for the rest of the session.
      </p>

      <h2>Time-of-day matters</h2>
      <p>
        Magnets behave differently depending on when price reaches them. A
        Magnet test in the first 30 minutes after the open is information-rich
        but noisy — opening drives often produce false reactions that get
        reversed by 10:30 AM. A Magnet test mid-morning (10:00–11:30 AM)
        usually carries more weight; the opening order flow has settled and a
        cleaner read is possible.
      </p>
      <p>
        Magnet tests in the lunch hour (roughly 12:00–1:30 PM ET) are the
        lowest quality of the day. Volume thins out, ranges compress, and
        false breaks proliferate. Most experienced ES traders treat the lunch
        Magnet test as "no trade by default" unless it's part of a larger
        setup that began earlier.
      </p>
      <p>
        The afternoon Magnet test (after 2:00 PM ET) is where trend days
        confirm or fail. If price has been above the Magnet all day and tests
        it from above in the afternoon, a clean rejection often produces the
        cleanest setup of the session — there's no time for the move to
        reverse and the closing imbalance can carry it.
      </p>

      <h2>How to size around a Magnet trade</h2>
      <p>
        Magnet trades are typically your highest-conviction trades of the day,
        which means they deserve full size — but only when they fit the
        framework. A clean Magnet rejection with bias alignment, in a
        favorable time window, with a defined invalidation, is a 100% size
        trade. A Magnet test that goes against your bias, at a low-quality
        time of day, with a wide stop, is a 25–50% size trade if you take it
        at all.
      </p>
      <p>
        The mistake to avoid is uniform sizing. Treating a high-quality Magnet
        rejection the same as a low-quality test wastes your edge on the good
        ones and exposes you to unnecessary drawdown on the bad ones.
      </p>

      <h2>What to do when the Magnet is wrong</h2>
      <p>
        Sometimes the Magnet you identified the night before just doesn't
        work. Price ignores it, blows through it without reaction, and never
        looks back. This happens on a minority of sessions. The discipline is
        not to fight it, and not to look for a "new Magnet" mid-session to
        justify a trade you already wanted to take.
      </p>
      <p>
        When your Magnet is wrong, the day usually becomes a trend day, and
        the trade is at the reaction levels rather than around the Magnet itself.
        Step aside from Magnet-based setups and let those levels work. Tomorrow
        is a new chart and a new Magnet.
      </p>

      <h2>Closing thought</h2>
      <p>
        A Magnet is the most useful single number on your chart, but only if
        you respect what it actually is: a center of gravity, not a guarantee.
        Identify it the night before. Wait for price to come to it. Trade the
        reaction, not the prediction.
      </p>

      <EndCta />
    </>
  );
}
