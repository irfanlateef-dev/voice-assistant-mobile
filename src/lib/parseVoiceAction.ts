export interface ParsedVoiceAction {
  action: string;
  payload?: Record<string, unknown>;
  sessionId?: string;
}

export function parseVoiceAction(raw: unknown): ParsedVoiceAction | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;

  if (data.type === 'action' && typeof data.action === 'string') {
    return {
      action: data.action,
      payload:
        data.payload && typeof data.payload === 'object'
          ? (data.payload as Record<string, unknown>)
          : undefined,
      sessionId: extractSessionId(data),
    };
  }

  if (typeof data.type === 'string' && data.type !== 'action') {
    return {
      action: data.type,
      payload: data,
      sessionId: extractSessionId(data),
    };
  }

  if (typeof data.action === 'string') {
    return {
      action: data.action,
      payload: data,
      sessionId: extractSessionId(data),
    };
  }

  return null;
}

function readId(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return undefined;
}

function extractSessionId(data: Record<string, unknown>): string | undefined {
  for (const key of ['sessionId', 'session_id', 'id'] as const) {
    const value = readId(data[key]);
    if (value) {
      return value;
    }
  }

  const nestedKeys = ['session', 'result', 'data'] as const;
  for (const key of nestedKeys) {
    const nested = data[key];
    if (nested && typeof nested === 'object') {
      const nestedRecord = nested as Record<string, unknown>;
      for (const idKey of ['sessionId', 'session_id', 'id'] as const) {
        const value = readId(nestedRecord[idKey]);
        if (value) {
          return value;
        }
      }
    }
  }

  const payload = data.payload;
  if (payload && typeof payload === 'object') {
    return extractSessionId(payload as Record<string, unknown>);
  }

  return undefined;
}
