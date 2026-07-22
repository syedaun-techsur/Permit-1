import { useAuthStore } from '../store/auth.store';
import { useUiStore } from '../store/ui.store';
import { authApi } from '../api/auth.api';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/auth.types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout: storeLogout, setLoading } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  function getDashboardPath(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:    return '/admin';
      case UserRole.REVIEWER: return '/reviewer';
      default:               return '/applicant';
    }
  }

  async function handleLogin(data: LoginRequest) {
    setLoading(true);
    try {
      const result = await authApi.login(data);
      login(result.user, result.accessToken);
      navigate(getDashboardPath(result.user.role), { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Login failed. Please try again.';
      addToast('error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(data: RegisterRequest) {
    setLoading(true);
    try {
      const result = await authApi.register(data);
      login(result.user, result.accessToken);
      navigate(getDashboardPath(result.user.role), { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Registration failed. Please try again.';
      addToast('error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Logout optimistically regardless of server response
    } finally {
      storeLogout();
      navigate('/login', { replace: true });
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    getDashboardPath,
  };
}
