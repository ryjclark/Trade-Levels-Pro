import { MidCta, EndCta } from "@/pages/public-article";

export function ArticleFailedBreakdown() {
  return (
    <>
      <p>
        If you take one thing from everything we publish, take this: the Failed
        Breakdown is the setup our daily plans are built around. On both ES and
        NQ, it's the trade we hunt first, size biggest, and rank at the top of
        every plan. Everything else is secondary.
      </p>

      <p>
        It fits our philosophy exactly. React to price, no predictions. You
        don't guess that a low will hold. You wait for the market to break it,
        fail, and tell you the break was a trap. Then you trade the reclaim.
      </p>

      <h2>What the pattern is</h2>
      <p>
        A Failed Breakdown has three parts, in order:
      </p>
      <ol>
        <li>
          <strong>The flush.</strong> Price trades below a significant low: a
          prior-day low, overnight low, prior-week low, the bottom of the
          month's range, or a major detected reaction level. Momentum sellers
          pile in on the break because "it broke support."
        </li>
        <li>
          <strong>The trap.</strong> Instead of following through, price stalls
          below the level and stops going down. The breakout sellers are now
          offside. Every tick back up is pressure on them.
        </li>
        <li>
          <strong>The reclaim.</strong> Price pushes back above the level and
          holds. The break is confirmed as false. That reclaim is the signal.
        </li>
      </ol>
      <blockquote>
        A breakdown that fails isn't a neutral event. It's a group of sellers
        trapped on the wrong side of a level they thought was breaking.
      </blockquote>

      <h2>Why it works</h2>
      <p>
        The engine behind the setup is trapped traders. When price breaks a
        well-watched low, a wave of shorts enters and a wave of longs sells to
        get flat. All of them are positioned for continuation down. The stops
        for that whole crowd sit just above the level they broke.
      </p>
      <p>
        When price reclaims the level, those traders are suddenly wrong. To get
        out, the shorts have to buy. Their covering is buying pressure, and it
        arrives right as fresh longs step in on the reclaim. That combination,
        trapped sellers covering plus new buyers entering, is what fuels the
        move back up. You're not predicting the bounce. You're positioning with
        the flow that the failed break itself created.
      </p>
      <p>
        This is why we favor the highest-quality lows. The more traders watching
        a level, the bigger the crowd that gets trapped when it fails, and the
        more fuel the reclaim has. A major detected level or a structure low
        traps more size than a micro pause.
      </p>

      <h2>Acceptance: the confirmation that keeps you out of trouble</h2>
      <p>
        The single most important rule in this setup is: do not knife-catch the
        flush. When price is stabbing below the level, you have no idea yet
        whether it's a trap or a real breakdown. Catching it there is a
        prediction, and predictions are exactly what we don't do.
      </p>
      <p>
        Instead you wait for acceptance back above the level. There are two ways
        we confirm it:
      </p>
      <ul>
        <li>
          <strong>Hold back above.</strong> Price trades back above the broken
          level and holds there rather than immediately failing again.
        </li>
        <li>
          <strong>Reclaim and hold.</strong> Price reclaims the level by about 5
          points and holds that reclaim for a couple of minutes.
        </li>
      </ul>
      <p>
        Either one tells you the same thing: sellers could not defend the break,
        and buyers have taken the level back. That's your green light. Waiting
        for acceptance costs you a few points of entry, and it saves you from
        the flushes that keep going.
      </p>

      <MidCta />

      <h2>The trade, step by step</h2>
      <p>
        Once acceptance confirms, the mechanics are the same on ES and NQ:
      </p>
      <ul>
        <li>
          <strong>Entry.</strong> Go long on acceptance, once price holds back
          above the reclaimed level or reclaims it by about 5 points and holds.
        </li>
        <li>
          <strong>Stop.</strong> Below the reclaimed level. The whole premise is
          that the level is holding again. If price loses it, the reclaim
          failed, and the reason you're in the trade is gone. You're out.
        </li>
        <li>
          <strong>First target.</strong> The next level up: often the Magnet, or
          the next detected level or structure level above your entry. Bank a
          piece here. This is the part of the trade you take off to lock in the
          reaction.
        </li>
        <li>
          <strong>Runner.</strong> Trail the rest toward the level after that. On
          a clean session, a Failed Breakdown that reclaims a major low can run
          level to level well beyond the first target.
        </li>
      </ul>
      <p>
        You manage the whole thing level to level, moving your stop up as each
        level is cleared and held. You're never predicting how far it goes. You
        let the levels tell you where to bank and where to trail.
      </p>

      <h2>It works on ES and NQ, with one caveat</h2>
      <p>
        The Failed Breakdown is contract-agnostic. Trapped sellers behave the
        same whether they're short ES or short NQ, so the setup shows up on both
        and we plan for it on both every evening.
      </p>
      <p>
        The caveat is that NQ is faster and wider. The flush below a level can be
        deeper and the reclaim sharper, so the roughly 5-point acceptance buffer
        that fits ES may need to be a bit wider on NQ, and the swings between
        levels are larger. Same pattern, same logic, more range. Size for the
        contract you're actually trading.
      </p>

      <h2>Common ways traders get it wrong</h2>
      <ul>
        <li>
          <strong>Catching the flush.</strong> Buying while price is still below
          the level, before any reclaim. That's a prediction, not the setup.
        </li>
        <li>
          <strong>Skipping acceptance.</strong> Buying the first tick back above
          the level without waiting for it to hold. Wicks back above a level
          fail all the time. Acceptance is what filters them.
        </li>
        <li>
          <strong>Trading a weak level.</strong> A micro level that only a few
          participants watch doesn't trap enough sellers to fuel much of a move.
          Rank your levels and lead with the best ones.
        </li>
        <li>
          <strong>Holding a failed reclaim.</strong> If price accepts back above
          the level, then loses it again, the setup is dead. Take the stop. Don't
          hope.
        </li>
      </ul>

      <h2>Why it anchors the plan</h2>
      <p>
        The Failed Breakdown gives you everything a reactive trader wants: a
        clear invalidation, a defined entry trigger, a fuel source you can
        explain, and levels that tell you where to manage. It doesn't ask you to
        know the future. It asks you to wait for the market to trap a crowd, then
        side with the flow that trap creates.
      </p>
      <p>
        That's why it sits at the top of every ES and NQ plan we publish. Find
        the significant low, wait for the flush and the trap, confirm the
        reclaim with acceptance, and manage level to level.
      </p>

      <EndCta />
    </>
  );
}
