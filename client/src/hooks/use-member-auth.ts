import { useState, useEffect, useCallback } from "react";

export const MEMBER_TOKEN_KEY = "tlp_member_session";

/** Lightweight member-session hook (magic-link login, token in localStorage). */
export function useMemberAuth() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(MEMBER_TOKEN_KEY),
  );
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const login = useCallback((t: string, e?: string) => {
    localStorage.setItem(MEMBER_TOKEN_KEY, t);
    setToken(t);
    if (e) setEmail(e);
  }, []);

  const logout = useCallback(async () => {
    const t = localStorage.getItem(MEMBER_TOKEN_KEY);
    localStorage.removeItem(MEMBER_TOKEN_KEY);
    setToken(null);
    setEmail(null);
    if (t) {
      try {
        await fetch("/api/member/logout", {
          method: "POST",
          headers: { authorization: `Bearer ${t}` },
        });
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Validate the stored token on mount / change.
  useEffect(() => {
    if (!token) {
      setChecked(true);
      return;
    }
    let cancelled = false;
    fetch("/api/member/me", { headers: { authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("invalid"))))
      .then((d) => {
        if (!cancelled) setEmail(d.email);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(MEMBER_TOKEN_KEY);
        setToken(null);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return { token, email, isMember: !!token, checked, login, logout };
}
