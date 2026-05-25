import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { config } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';
import * as secureStorage from '@/lib/secureStorage';
import type { ApiError } from '@/types/api.types';

const api = axios.create({
  baseURL: config.apiBase,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((requestConfig: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      await secureStorage.removeItem();
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      'Something went wrong. Please try again.'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export default api;
