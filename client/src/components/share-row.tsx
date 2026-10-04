import { useState } from "react";
import { SOCIAL } from "@/components/social-links";

// "Share this" row for /sample and /learn articles. No third-party scripts:
// Share on X uses the intent URL, Copy link uses the clipboard API, and the
// native Share button only shows when the browser supports navigator.share.
export default function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const canNative =
    typeof navigator !== "undefined" && typeof (navigator as any).share === "function";

  const pageUrl = () =>
    typeof window !== "undefined" ? window.location.href : "https://tradelevelspro.com";
  const xHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(pageUrl())}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked; no-op */
    }
  }

  async function nativeShare() {
    try {
      await (navigator as any).share({ title, url: pageUrl() });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div
      className="share-row"
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 28,
        paddingTop: 20,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ fontSize: 13, opacity: 0.7 }}>Share this:</span>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary"
        data-testid="share-x"
      >
        Share on X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="btn-secondary"
        data-testid="share-copy"
        style={{ border: "none", cursor: "pointer" }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      {canNative && (
        <button
          type="button"
          onClick={nativeShare}
          className="btn-secondary"
          data-testid="share-native"
          style={{ border: "none", cursor: "pointer" }}
        >
          Share
        </button>
      )}
      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="public-link"
        data-testid="share-instagram"
      >
        Follow @tradelevelspro on Instagram
      </a>
    </div>
  );
}
