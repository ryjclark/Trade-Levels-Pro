// Shared social follow links (X + Instagram). Inline SVGs, no third-party
// scripts. Used in the footer (icon links) and the header/mobile menu.
export const SOCIAL = {
  x: "https://x.com/TradeLevelsPro",
  instagram: "https://www.instagram.com/tradelevelspro/",
} as const;

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** Icon links for the footer and desktop header. */
export function SocialIconLinks({ idSuffix = "" }: { idSuffix?: string }) {
  return (
    <div className="social-links" style={{ display: "inline-flex", gap: 14, alignItems: "center" }}>
      <a
        href={SOCIAL.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Trade Levels Pro on X"
        data-testid={`link-social-x${idSuffix}`}
        style={{ color: "inherit", display: "inline-flex" }}
      >
        <XIcon />
      </a>
      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Trade Levels Pro on Instagram"
        data-testid={`link-social-instagram${idSuffix}`}
        style={{ color: "inherit", display: "inline-flex" }}
      >
        <InstagramIcon />
      </a>
    </div>
  );
}

/** Text links for the mobile menu. */
export function SocialTextLinks({ idSuffix = "-mobile" }: { idSuffix?: string }) {
  return (
    <>
      <a
        href={SOCIAL.x}
        target="_blank"
        rel="noopener noreferrer"
        className="public-link"
        data-testid={`link-social-x${idSuffix}`}
      >
        Follow on X
      </a>
      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="public-link"
        data-testid={`link-social-instagram${idSuffix}`}
      >
        Follow on Instagram
      </a>
    </>
  );
}
