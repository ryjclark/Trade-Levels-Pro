import { useState, useEffect } from "react";

const AUTH_TOKEN_KEY = "trade_levels_auth";

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
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  };

  return { isAuthenticated, isLoading, login, logout, checkAuth, getToken };
}
