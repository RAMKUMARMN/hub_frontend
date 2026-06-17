import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

const storeTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }
};

const clearStoredTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        storeTokens(accessToken, refreshToken);
        set({ user, accessToken });
      },
      setTokens: (accessToken, refreshToken) => {
        storeTokens(accessToken, refreshToken);
        set({ accessToken });
      },
      clearAuth: () => {
        clearStoredTokens();
        set({ user: null, accessToken: null });
      },
      logout: () => {
        clearStoredTokens();
        set({ user: null, accessToken: null });
      },
    }),
    { name: "auth-storage", partialize: (s) => ({ user: s.user }) }
  )
);
