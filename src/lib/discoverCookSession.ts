import * as cookingService from '@/services/cooking.service';
import type { CookingSession } from '@/types/cooking.types';

const ACTIVE_STATUSES = new Set<CookingSession['status']>([
  'gathering_prefs',
  'confirmed',
  'cooking',
]);

export function isActiveCookSession(session: CookingSession): boolean {
  return ACTIVE_STATUSES.has(session.status);
}

export function isSessionRelevantSince(
  session: CookingSession,
  sinceMs: number,
): boolean {
  const created = new Date(session.createdAt).getTime();
  const updated = new Date(session.updatedAt).getTime();
  const threshold = sinceMs - 10_000;
  return created >= threshold || updated >= threshold;
}

export async function discoverLatestActiveSession(
  sinceMs?: number,
): Promise<CookingSession | undefined> {
  const response = await cookingService.getSessions();
  const candidates = response.sessions
    .filter(isActiveCookSession)
    .filter((session) =>
      sinceMs === undefined ? true : isSessionRelevantSince(session, sinceMs),
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  return candidates[0];
}
