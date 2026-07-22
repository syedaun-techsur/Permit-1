import { create } from 'zustand';
import type { User, AuthState } from '../types/auth.types';

interface AuthActions {
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  login: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setAccessToken: (token) =>
    set({ accessToken: token }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}));
