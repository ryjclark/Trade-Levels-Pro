// Latest intraday-proof snapshot, shared read-only with the SSR layer.
//
// routes.ts computes the proof (cached, 3h TTL) and writes the latest result
// here; server/seo-meta.ts reads it SYNCHRONOUSLY to render the numbers into the
// /track-record prerender. This keeps the SSR path free of any network/await:
// if the snapshot is null (cold start) the prerender simply falls back to its
// static text. Display only.
export type ProofSnapshot = {
  updatedAt: string;
  tolerancePts: number;
  interval: string;
  bySymbol: Record<string, any>;
};

let SNAPSHOT: ProofSnapshot | null = null;

export function setProofSnapshot(s: ProofSnapshot): void {
  SNAPSHOT = s;
}

export function getProofSnapshot(): ProofSnapshot | null {
  return SNAPSHOT;
}
