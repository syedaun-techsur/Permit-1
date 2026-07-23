import { create } from 'zustand';
import type { User, AuthState } from '../types/auth.types';

/**
 * Decode the `exp` claim from a JWT access token without external libraries.
 * Returns the expiry as a Unix millisecond timestamp, or null if decoding fails.
 */
function decodeTokenExpiry(token: string): number | null {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return null;
    const payload = JSON.parse(atob(payloadB64)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

interface AuthActions {
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  /** Refresh the access token by calling POST /auth/refresh */
  refreshToken: () => Promise<void>;
}

/** Extended auth state — includes JWT expiry for the SessionExpiryWarning component */
interface ExtendedAuthState extends AuthState {
  /** Unix ms timestamp when the current access token expires, or null if not logged in */
  accessTokenExpiresAt: number | null;
}

type AuthStore = ExtendedAuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  isAuthenticated: false,
  isLoading: false,

  login: (user, accessToken) =>
    set({
      user,
      accessToken,
      accessTokenExpiresAt: decodeTokenExpiry(accessToken),
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      accessTokenExpiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setAccessToken: (token) =>
    set({
      accessToken: token,
      accessTokenExpiresAt: decodeTokenExpiry(token),
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  refreshToken: async () => {
    try {
      // Lazy import to avoid circular dependencies
      const { authApi } = await import('../api/auth.api');
      const { accessToken } = await authApi.refresh();
      get().setAccessToken(accessToken);
    } catch {
      // If refresh fails, log the user out
      get().logout();
    }
  },
}));
