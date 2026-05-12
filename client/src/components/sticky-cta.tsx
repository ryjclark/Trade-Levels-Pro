import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import { CTA_TEXT } from "@/lib/constants";

const STORAGE_KEY = "tlp_sticky_dismissed";

export default function StickyCta() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      setDismissed(true);
      return;
    }
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !show) return null;

  return (
    <div className="sticky-cta" data-testid="sticky-cta">
      <Link
        href="/pricing"
        className="sticky-cta-link"
        data-testid="sticky-cta-link"
      >
        {CTA_TEXT} →
      </Link>
      <button
        type="button"
        className="sticky-cta-close"
        aria-label="Dismiss"
        data-testid="sticky-cta-close"
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
