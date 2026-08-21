"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMe, login as apiLogin, register as apiRegister } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean; // resolving the initial session on mount
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    ward?: number;
  }) => Promise<void>;
  logout: () => void;
}

const ACCESS_KEY = "ua_access";
const REFRESH_KEY = "ua_refresh";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Resolve any persisted session exactly once on mount.
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    fetchMe()
      .then((user) =>
        setState({ user, isLoading: false, isAuthenticated: true }),
      )
      .catch(() => {
        // Stale token — clear it so the UI reflects logged-out state.
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const persist = useCallback((access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken, refreshToken, user } = await apiLogin({ email, password });
      persist(accessToken, refreshToken);
      setState({ user, isLoading: false, isAuthenticated: true });
    },
    [persist],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string; ward?: number }) => {
      const { accessToken, refreshToken, user } = await apiRegister(input);
      persist(accessToken, refreshToken);
      setState({ user, isLoading: false, isAuthenticated: true });
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
