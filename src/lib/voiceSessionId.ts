export function resolveVoiceSessionId(
  payload?: Record<string, unknown>,
  actionSessionId?: string,
  fallbackSessionId?: string,
): string | undefined {
  if (typeof actionSessionId === 'string' && actionSessionId.length > 0) {
    return actionSessionId;
  }

  if (payload) {
    for (const key of ['sessionId', 'session_id', 'id'] as const) {
      const value = payload[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    for (const key of ['session', 'result', 'data'] as const) {
      const nested = payload[key];
      if (nested && typeof nested === 'object') {
        const record = nested as Record<string, unknown>;
        for (const idKey of ['sessionId', 'session_id', 'id'] as const) {
          const value = record[idKey];
          if (typeof value === 'string' && value.length > 0) {
            return value;
          }
        }
      }
    }
  }

  return fallbackSessionId;
}
