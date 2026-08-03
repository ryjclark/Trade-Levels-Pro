import { MidCta, EndCta } from "@/pages/public-article";

export function ArticleHowToTradeThePlan() {
  return (
    <>
      <p>
        New here? Start with this. Every trading day you get one plan per market
        (ES and NQ) with the same structure. Once you can read it in ten seconds,
        the whole service clicks. Here is exactly what each part means and how to
        act on it.
      </p>

      <h2>The parts of the plan</h2>
      <ul>
        <li>
          <strong>Bias.</strong> A one-word read (bullish, neutral, bearish)
          based on where price closed relative to the Magnet. It is context, not
          a command. You still wait for a setup.
        </li>
        <li>
          <strong>Magnet.</strong> The session's center of gravity, the level
          price tends to return to. Longs from below aim up toward it, shorts
          from above aim down toward it. It is your main reference all day.
        </li>
        <li>
          <strong>Dynamic Zone.</strong> A band around the Magnet where price
          chops. If price is inside the zone and not at an edge, there is no
          trade. Sitting still is the play.
        </li>
        <li>
          <strong>Failed-breakdown longs.</strong> The main event, ranked best
          first. These are the significant lows below the Magnet where we hunt
          the reclaim.
        </li>
        <li>
          <strong>Rejection shorts.</strong> The secondary play, the significant
          resistances above the Magnet. Lower win rate, so smaller size.
        </li>
      </ul>

      <MidCta />

      <h2>How to take a failed-breakdown long</h2>
      <ol>
        <li>
          Price flushes below one of the listed levels. Sellers pile in on the
          break.
        </li>
        <li>
          It reclaims the level, back above the line. That is the trap springing.
        </li>
        <li>
          <strong>Wait for acceptance.</strong> Do not knife-catch the reclaim.
          Either price holds back above the level, or it reclaims by roughly five
          points and holds for a couple of minutes. Acceptance is the whole game.
        </li>
        <li>
          Enter on acceptance, stop just below the reclaimed level, first target
          the Magnet.
        </li>
        <li>
          <strong>Manage level to level.</strong> Bank a partial at the Magnet,
          move your stop, and trail a runner toward the next level. You are never
          trying to catch the whole move at once.
        </li>
      </ol>

      <h2>How to take a rejection short</h2>
      <p>
        Same idea in reverse and sized down. Price pushes up into a listed
        resistance, fails to hold above it, and you short back toward the Magnet
        with a stop just above the level. Most breakdowns and breakouts trap, so
        the discipline is identical: wait for the level to fail, do not predict
        that it will.
      </p>

      <h2>The rules that keep you out of trouble</h2>
      <ul>
        <li>If price is not at one of your levels, you have no edge. Wait.</li>
        <li>
          Acceptance before entry, every time. It is the difference between
          catching the reclaim and catching a falling knife.
        </li>
        <li>
          Manage level to level and take partials. A runner that stops at
          break-even cannot turn a green day red.
        </li>
        <li>
          When both setups have triggered or invalidated, you are done. Walk
          away.
        </li>
      </ul>

      <p>
        That is the entire method. React to price, no predictions. The plan hands
        you the levels every day so you can show up prepared and trade the same
        way every session.
      </p>

      <EndCta />
    </>
  );
}
