import api from '@/services/api';
import type {
  CreateSessionResponse,
  NotesResponse,
  SessionResponse,
  SessionsResponse,
} from '@/types/cooking.types';

export async function getSessions(): Promise<SessionsResponse> {
  const response = await api.get<SessionsResponse>('/api/cooking/sessions');
  return response.data;
}

export async function getSession(sessionId: string): Promise<SessionResponse> {
  const response = await api.get<SessionResponse>(
    `/api/cooking/session/${sessionId}`,
  );
  return response.data;
}

export async function createSession(
  dishName: string,
): Promise<CreateSessionResponse> {
  const response = await api.post<CreateSessionResponse>(
    '/api/cooking/session',
    { dishName },
  );
  return response.data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/api/cooking/session/${sessionId}`);
}

export async function getSessionNotes(
  sessionId: string,
): Promise<NotesResponse> {
  const response = await api.get<NotesResponse>(
    `/api/cooking/session/${sessionId}/notes`,
  );
  return response.data;
}
