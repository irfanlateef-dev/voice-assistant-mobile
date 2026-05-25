import { useCallback } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import * as secureStorage from '@/lib/secureStorage';
import * as authService from '@/services/auth.service';
import { getErrorMessage } from '@/services/api';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authService.login(email, password);
        await secureStorage.setItem(secureStorage.TOKEN_KEY, response.token);
        setAuth(response.token, response.user);
        return { success: true as const };
      } catch (error) {
        return { success: false as const, error: getErrorMessage(error) };
      }
    },
    [setAuth],
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
    ) => {
      try {
        const response = await authService.signup(
          name,
          email,
          password,
          confirmPassword,
        );
        await secureStorage.setItem(secureStorage.TOKEN_KEY, response.token);
        setAuth(response.token, response.user);
        return { success: true as const };
      } catch (error) {
        return { success: false as const, error: getErrorMessage(error) };
      }
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    await secureStorage.removeItem();
    clearAuth();
    router.replace('/(auth)/login');
  }, [clearAuth]);

  const getToken = useCallback(() => token, [token]);

  const isAuthenticated = Boolean(token && user);

  return {
    user,
    token,
    isHydrated,
    login,
    signup,
    logout,
    getToken,
    isAuthenticated,
  };
}
