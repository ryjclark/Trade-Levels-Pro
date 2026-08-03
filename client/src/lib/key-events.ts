export interface KeyEvent {
  label: string;
  note: string;
}

// Manually maintained high-impact macro events, keyed by YYYY-MM-DD (ET).
// Update this monthly with the scheduled FOMC / CPI / PPI dates. NFP (the jobs
// report, first Friday of the month) is detected automatically below, so it does
// not need an entry here.
const MANUAL_EVENTS: Record<string, KeyEvent> = {
  // Example (edit with real dates):
  // "2026-08-12": { label: "CPI", note: "Inflation data at 8:30 AM ET." },
  // "2026-08-19": { label: "FOMC minutes", note: "Released 2:00 PM ET." },
};

function isFirstFriday(d: Date): boolean {
  return d.getDay() === 5 && d.getDate() <= 7;
}

/** Returns a high-impact event for the given plan date, or null. */
export function keyEventForDate(dateStr: string | null | undefined): KeyEvent | null {
  if (!dateStr) return null;
  if (MANUAL_EVENTS[dateStr]) return MANUAL_EVENTS[dateStr];
  const d = new Date(`${dateStr}T12:00:00`);
  if (!isNaN(d.getTime()) && isFirstFriday(d)) {
    return {
      label: "Jobs report (NFP)",
      note: "High-impact data at 8:30 AM ET. Expect a wider range and a whippy open, so size down and wait for acceptance.",
    };
  }
  return null;
}
