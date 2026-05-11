import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function PublicNav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) =>
    location === path ? "public-link public-link-active" : "public-link";

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
          <Link href="/" className={isActive("/")} data-testid="link-home">
            Home
          </Link>
          <Link href="/sample" className={isActive("/sample")} data-testid="link-sample">
            Sample
          </Link>
          <Link
            href="/how-it-works"
            className={isActive("/how-it-works")}
            data-testid="link-how-it-works"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className={isActive("/pricing")}
            data-testid="link-pricing"
          >
            Pricing
          </Link>
          <Link href="/login" className={isActive("/login")} data-testid="link-login">
            Login
          </Link>
        </div>
      </nav>
    </div>
  );
}
