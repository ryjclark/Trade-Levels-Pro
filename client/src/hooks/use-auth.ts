import { useState, useEffect } from "react";

export const AUTH_TOKEN_KEY = "tlp_admin_session";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/check", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  };

  return { isAuthenticated, isLoading, login, logout, checkAuth, getToken };
}
