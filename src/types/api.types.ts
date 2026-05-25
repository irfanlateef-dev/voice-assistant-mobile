export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface MeResponse {
  user: User;
}

export interface ConfigResponse {
  agent: {
    greeting: string;
  };
}

export interface LiveKitTokenResponse {
  token: string;
}
