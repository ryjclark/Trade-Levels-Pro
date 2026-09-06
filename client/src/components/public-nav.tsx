import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMemberAuth } from "@/hooks/use-member-auth";

const BASE_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/terminal", label: "Today's Plan" },
  { href: "/sample", label: "Sample" },
  { href: "/track-record", label: "Track Record" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/prop-firms", label: "Prop Firms" },
  { href: "/learn", label: "Learn" },
  { href: "/pricing", label: "Pricing" },
];

export default function PublicNav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMember } = useMemberAuth();

  // Last nav item is account-aware: "Account" for signed-in members, else "Log in".
  const NAV_ITEMS = [
    ...BASE_NAV_ITEMS,
    isMember
      ? { href: "/account", label: "Account" }
      : { href: "/member-login", label: "Log in" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(path + "/");
  };

  return (
    <div className={`public-nav-wrap ${scrolled ? "scrolled" : ""}`}>
      <nav className="public-navbar">
        <Link href="/" className="public-brand" data-testid="link-brand">
          <img
            src="/images/logo-square.webp"
            alt="Trade Levels Pro"
            className="public-brand-logo"
          />
          <span>
            Trade Levels<span className="brand-pro">Pro</span>
          </span>
        </Link>
        <button
          type="button"
          className="public-nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          data-testid="button-nav-toggle"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`public-nav-links ${menuOpen ? "open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={
                isActive(item.href)
                  ? "public-link public-link-active"
                  : "public-link"
              }
              data-testid={`link-nav-${item.href.replace(/\//g, "") || "home"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
