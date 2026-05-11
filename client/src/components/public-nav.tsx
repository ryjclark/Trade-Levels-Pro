import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/sample", label: "Sample" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/prop-firms", label: "Prop Firms" },
  { href: "/learn", label: "Learn" },
  { href: "/indicator", label: "Indicator" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Login" },
];

export default function PublicNav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <div className="public-nav-links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
