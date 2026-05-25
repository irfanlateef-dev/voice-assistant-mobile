import api from '@/services/api';
import type { AuthResponse, ConfigResponse, MeResponse } from '@/types/api.types';

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function signup(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/signup', {
    name,
    email,
    password,
    confirmPassword,
  });
  return response.data;
}

export async function getMe(): Promise<MeResponse> {
  const response = await api.get<MeResponse>('/api/auth/me');
  return response.data;
}

export async function getConfig(): Promise<ConfigResponse> {
  const response = await api.get<ConfigResponse>('/api/config');
  return response.data;
}
