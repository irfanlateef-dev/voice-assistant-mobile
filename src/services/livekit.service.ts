import { config } from '@/constants/config';
import api from '@/services/api';
import type { LiveKitTokenResponse } from '@/types/api.types';

export async function getToken(
  room: string,
  sessionId?: string,
): Promise<string> {
  const params: Record<string, string> = { room };
  if (sessionId) {
    params.sessionId = sessionId;
  }
  if (config.maxCompletionTokens !== undefined) {
    params.max_completion_tokens = String(config.maxCompletionTokens);
  }

  const response = await api.get<LiveKitTokenResponse>('/api/token', {
    params,
  });
  return response.data.token;
}
