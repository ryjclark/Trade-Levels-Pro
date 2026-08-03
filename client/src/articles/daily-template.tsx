import { MidCta, EndCta } from "@/pages/public-article";

export function ArticleDailyTemplate() {
  return (
    <>
      <p>
        Our whole philosophy fits on one line: react to price, no predictions.
        The daily plan is not a forecast of where ES or NQ is going. It's a map
        of the levels that matter and a pre-written set of trades for when price
        arrives at them.
      </p>

      <p>
        Every evening, after the cash close, we build the same plan for both ES
        and NQ. Levels are set once the session settles and posted by 5:30 PM
        ET. This post walks through the exact process, in the order we do it, so
        you can see how the pieces fit together before the next session opens.
      </p>

      <p>
        (One housekeeping note: the market data shown on the site is delayed by
        about a minute. The levels themselves are fixed the night before, so the
        delay never affects your plan. It just means you confirm entries on your
        own live chart.)
      </p>

      <h2>The evening process, start to finish</h2>
      <p>
        There are five steps, and we run them the same way on both contracts.
        ES and NQ move together most of the time but not always, so each gets
        its own plan and its own levels. Never assume an NQ setup is valid just
        because the ES version is.
      </p>

      <h2>Step 1: Mark the Magnet and the Dynamic Zone</h2>
      <p>
        The Magnet is the session's center of gravity, the floor pivot that
        price keeps getting pulled back toward intraday. It's one number per
        contract. It's not a target and it's not a prediction. It's the price
        the auction has unfinished business at, so price tends to revisit it.
      </p>
      <p>
        Around the Magnet we draw the Dynamic Zone, a volatility band that
        frames how far price is likely to wander before the Magnet's pull shows
        up again. When price is sitting mid-zone with no edge in play, that's a
        no-trade condition. The zone tells you where <em>not</em> to force
        something as much as where to pay attention.
      </p>
      <blockquote>
        The Magnet tells you where the day's gravity is. The Dynamic Zone tells
        you how much room price has to breathe around it before it matters.
      </blockquote>

      <h2>Step 2: Map the structure and the detected reaction levels</h2>
      <p>
        With the Magnet and zone placed, we lay in the structure levels. These
        are the objective, non-negotiable prices every serious participant is
        watching:
      </p>
      <ul>
        <li>Prior-day high, low, and close.</li>
        <li>Overnight high and low.</li>
        <li>Prior-week high and low.</li>
        <li>The roughly one-month range (the swing high and low of the last month).</li>
      </ul>
      <p>
        On top of the structure, we add the detected reaction and swing levels:
        prices where the market has actually turned, ranked by quality. We tag
        each one <strong>major</strong>, <strong>minor</strong>, or{" "}
        <strong>micro</strong>. A major level is a price price has reacted to
        cleanly and repeatedly. A micro is a minor pause that's worth noting but
        not worth much size. This ranking is what lets you prioritize later:
        best-quality level first.
      </p>

      <h2>Step 3: Set a bias</h2>
      <p>
        The bias is one conditional sentence, tied to a level, for each
        contract. Not "I think ES goes up." Rather: "bullish while ES holds
        above the Magnet, cautious below the prior-day low." The condition{" "}
        <em>is</em> the bias. It tells you which setups you lean into and which
        you size down or skip.
      </p>
      <p>
        Because ES and NQ can diverge, write the bias for each separately. Some
        days NQ is leading with strength while ES is heavy near a resistance
        shelf. That divergence is information, not a contradiction to resolve.
      </p>

      <MidCta />

      <h2>Step 4: Write the ranked Failed-Breakdown longs</h2>
      <p>
        The Failed Breakdown is our primary setup, and this is where the plan
        gets specific. Price flushes below a significant low, traps the sellers
        who chased the break, then reclaims the level. The trapped shorts become
        fuel as they cover, and you go long on acceptance.
      </p>
      <p>
        We list these longs in ranked order, best-quality level first. The major
        detected levels and the structure lows (prior-day low, overnight low,
        prior-week low, the month low) are the highest-quality flush candidates.
        Minor and micro levels come after. Each entry in the plan reads the same
        way:
      </p>
      <ul>
        <li>
          <strong>The level:</strong> the significant low we expect price may
          flush and reclaim.
        </li>
        <li>
          <strong>The acceptance rule:</strong> do not knife-catch the flush.
          Wait for price to hold back above the level, or to reclaim it by about
          5 points and hold there for a couple of minutes. Acceptance is the
          trigger, not the tag.
        </li>
        <li>
          <strong>The stop:</strong> back below the reclaimed level. If price
          loses it again, the reclaim failed and you're out.
        </li>
        <li>
          <strong>Management:</strong> level to level. Bank the first target at
          the next level up, then trail a runner toward the level after that.
        </li>
      </ul>
      <p>
        The best Failed Breakdown of the day is usually at the highest-quality
        low in the plan, which is why the ranking matters. If price flushes a
        micro level and reclaims it, that's a smaller, lower-conviction version
        of the same trade. Same pattern, less size.
      </p>

      <h2>Step 5: Write the secondary rejection shorts</h2>
      <p>
        The secondary setup is a rejection short at a significant resistance
        above the Magnet: a major detected level, the prior-day high, overnight
        high, or the top of the range. Price pushes into resistance, fails to
        accept above it, and rolls over. You short the rejection and, again,
        manage level to level down toward the Magnet.
      </p>
      <p>
        Rejection shorts are lower win-rate than Failed Breakdowns for us, so
        we size them down. They're the counter-punch, not the main event. On a
        strong-bias-up day we may skip them entirely and only take the longs.
      </p>

      <h2>What a finished plan looks like</h2>
      <p>
        For each contract, the finished plan is: one Magnet, one Dynamic Zone,
        the structure levels, the ranked detected levels, a one-sentence
        conditional bias, the ranked Failed-Breakdown longs with acceptance and
        level-to-level management, and the secondary rejection shorts sized
        down. Two contracts, same structure, built fresh every evening.
      </p>
      <p>
        The next morning your job is small: mark the levels, read the bias once,
        and wait. Do nothing until price is at one of your levels and the
        acceptance conditions are met. If nothing triggers, that's a fine day.
        You reacted to price, and price never gave you the setup.
      </p>

      <h2>Why we build it this way</h2>
      <p>
        Every step exists to take a decision out of the heat of the session. The
        Magnet decides where you focus. The Dynamic Zone decides where you don't
        trade. The structure and detected levels decide where the trades live.
        The bias decides which side you favor. The ranked setups decide the
        trigger and the management before you have any money on the line.
      </p>
      <p>
        By the open, there's nothing left to predict. There's only price, your
        levels, and the question the whole plan was built to answer: did the
        setup trigger, yes or no.
      </p>

      <EndCta />
    </>
  );
}
