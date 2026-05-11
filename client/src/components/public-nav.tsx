import { Link, useLocation } from "wouter";

export default function PublicNav() {
  const [location] = useLocation();
  const isActive = (path: string) =>
    location === path ? "public-link public-link-active" : "public-link";

  return (
    <nav className="public-navbar">
      <Link href="/" className="public-brand" data-testid="link-brand">
        <img
          src="/images/logo-square.webp"
          alt="Trade Levels Pro"
          className="public-brand-logo"
        />
        Trade Levels Pro
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
  );
}
