import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  name: string;
  subscriptionTier: string;
}

interface AuthState {
  authToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token: string, user: User) => {
        set({ authToken: token, user, isAuthenticated: true });
      },
      clearAuth: () => {
        set({ authToken: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "ritual-auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
