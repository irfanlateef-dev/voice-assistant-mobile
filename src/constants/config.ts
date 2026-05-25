const apiBase = process.env.EXPO_PUBLIC_API_BASE;
const livekitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;

function parseOptionalPositiveInt(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

const maxCompletionTokens = parseOptionalPositiveInt(
  process.env.EXPO_PUBLIC_MAX_COMPLETION_TOKENS,
);

if (!apiBase) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_BASE environment variable. Copy .env.example to .env and set your API base URL.',
  );
}

if (!livekitUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_LIVEKIT_URL environment variable. Copy .env.example to .env and set your LiveKit URL.',
  );
}

export const config = {
  apiBase,
  livekitUrl,
  maxCompletionTokens,
} as const;

export const DEMO_CREDENTIALS = {
  email: 'demo@voice-agent.local',
  password: 'demo1234',
} as const;

export const STALL_TIMEOUT_MS = 90_000;
export const THINKING_STALL_TIMEOUT_MS = 120_000;
