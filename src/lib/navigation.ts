import { router } from 'expo-router';
import { teardownActiveVoiceSession } from '@/lib/voiceSession';

export function openNewCookSession(): void {
  void teardownActiveVoiceSession().then(() => {
    router.replace('/cook');
  });
}

export function openCookSession(sessionId: string): void {
  void teardownActiveVoiceSession().then(() => {
    router.replace({
      pathname: '/cook/[sessionId]',
      params: { sessionId },
    });
  });
}

export function normalizeRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
