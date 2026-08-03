import { MidCta, EndCta } from "@/pages/public-article";

export function ArticleAcceptance() {
  return (
    <>
      <p>
        A good level and a good setup are only half the job. The other half is
        how you get in and how you manage the trade once you're in. For us that
        comes down to two disciplines: acceptance on the entry, and level-to-
        level management on the exit. Both apply the same way on ES and NQ.
      </p>

      <p>
        These two ideas are what keep the philosophy honest. React to price, no
        predictions. Acceptance stops you from predicting a turn before price
        confirms it. Level-to-level management stops you from predicting how far
        a move will run.
      </p>

      <h2>Acceptance: why you wait</h2>
      <p>
        When price hits one of your levels, the temptation is to act
        immediately: the flush is here, the reclaim looks like it's starting, get
        in. That instinct is a prediction. You're betting the level will hold
        before the market has shown you it will.
      </p>
      <p>
        Acceptance is the fix. Instead of trading the tag, you wait for price to
        prove it has taken the level back. On a Failed Breakdown, price flushes
        below a significant low and traps sellers. The knife-catch buys while
        it's still falling. Acceptance waits until price is back above the level
        and holding, when the trapped sellers are the ones under pressure, not
        you.
      </p>
      <blockquote>
        Waiting for acceptance costs you a few points of entry. Not waiting costs
        you the trades where the flush just keeps going.
      </blockquote>

      <h2>The two ways we confirm acceptance</h2>
      <p>
        We use two simple, concrete confirmations. Either one is enough:
      </p>
      <ul>
        <li>
          <strong>Hold back above the level.</strong> Price trades back above the
          reclaimed level and stays there rather than immediately dropping under
          again. It's holding, not just wicking.
        </li>
        <li>
          <strong>Reclaim by about 5 points and hold.</strong> Price pushes back
          through the level by roughly 5 points and holds that reclaim for a
          couple of minutes. The buffer and the time filter out the fake
          reclaims.
        </li>
      </ul>
      <p>
        Both are doing the same job: separating a real reclaim from a wick. A
        wick back above a level happens constantly and means nothing. A hold, or
        a reclaim-and-hold, means buyers actually took the level. On NQ, which
        moves faster and wider, you may give the 5-point buffer a little more
        room, but the principle is identical.
      </p>
      <p>
        Once acceptance confirms, your stop goes back below the reclaimed level.
        The logic is clean: you're in because the level held, so if it stops
        holding, you're out.
      </p>

      <MidCta />

      <h2>Managing level to level</h2>
      <p>
        After you're in on acceptance, the exit is just as structured as the
        entry, and it uses the same levels you mapped the night before. We don't
        set one target and hope. We manage level to level.
      </p>
      <p>
        Here's the rhythm:
      </p>
      <ul>
        <li>
          <strong>Bank the first target.</strong> The first level up from your
          entry, often the Magnet or the next detected or structure level, is
          where you take a piece off. This locks in the reaction you were trading
          and takes the pressure off the rest of the position.
        </li>
        <li>
          <strong>Trail a runner.</strong> Keep part of the position on for the
          next level, and the one after that. On a clean day a Failed Breakdown
          off a major low can carry through several levels.
        </li>
        <li>
          <strong>Move your stops as levels clear.</strong> Each time price
          clears a level and holds above it, that level becomes your new floor.
          Trail the stop up behind it. A move that was risking to your entry is
          now a trade you can't lose money on.
        </li>
      </ul>
      <p>
        The levels do the work. You're not guessing where to exit or setting an
        arbitrary point count. Price tells you where the next decision is: the
        next level. You react when it gets there.
      </p>

      <h2>Why this beats a fixed target</h2>
      <p>
        A fixed target caps your good trades and does nothing for your bad ones.
        The days you most want to press are the days a single target would have
        left most of the move on the table. Level-to-level management keeps you
        in those runs while still banking something at the first level, so the
        winners can be larger than the losers.
      </p>
      <p>
        Banking the first target is what makes trailing the runner emotionally
        possible. Once you've locked in a piece and moved your stop up, the
        runner is playing with the market's money. You can let it breathe instead
        of snatching at it, because a pullback no longer threatens your day.
      </p>

      <h2>Staying reactive the whole way through</h2>
      <p>
        Both disciplines are really the same idea applied at two moments. On the
        entry, you don't predict the turn, you wait for acceptance to confirm it.
        On the exit, you don't predict the destination, you let each level tell
        you whether to bank, trail, or get out.
      </p>
      <p>
        That's what it means to react to price. The plan gives you the levels.
        Acceptance gives you the trigger. Level-to-level gives you the
        management. At no point are you asked to know the future, on ES or NQ.
        You're only ever asked to respond to what price is doing at a level you
        already marked.
      </p>

      <EndCta />
    </>
  );
}
