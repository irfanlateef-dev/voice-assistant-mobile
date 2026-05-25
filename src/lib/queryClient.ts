import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 300_000,
    },
  },
});

export const queryKeys = {
  sessions: ['cooking', 'sessions'] as const,
  session: (sessionId: string) => ['cooking', 'session', sessionId] as const,
  sessionNotes: (sessionId: string) =>
    ['cooking', 'session', sessionId, 'notes'] as const,
};
