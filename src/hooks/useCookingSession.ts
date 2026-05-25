import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import * as cookingService from '@/services/cooking.service';
import { getErrorMessage } from '@/services/api';
import type { CookingSession } from '@/types/cooking.types';

export function useCookingSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: async () => {
      const response = await cookingService.getSessions();
      return response.sessions;
    },
  });
}

export function useCookingSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.session(sessionId ?? ''),
    queryFn: async () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const response = await cookingService.getSession(sessionId);
      return response.session;
    },
    enabled: Boolean(sessionId),
  });
}

export function useSessionNotes(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sessionNotes(sessionId ?? ''),
    queryFn: async () => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const response = await cookingService.getSessionNotes(sessionId);
      return response.notes;
    },
    enabled: Boolean(sessionId),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => cookingService.deleteSession(sessionId),
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions });
      const previous = queryClient.getQueryData(queryKeys.sessions);
      queryClient.setQueryData<CookingSession[]>(
        queryKeys.sessions,
        (old) => old?.filter((session) => session.id !== sessionId),
      );
      return { previous };
    },
    onError: (_error, _sessionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.sessions, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dishName: string) => cookingService.createSession(dishName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
    },
  });
}

export function useVoiceActionInvalidation(sessionId?: string) {
  const queryClient = useQueryClient();

  return (action: string) => {
    switch (action) {
      case 'session_created':
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        break;
      case 'ingredient_added':
      case 'step_advanced':
      case 'step_completed':
      case 'recipe_saved':
      case 'preferences_saved':
        if (sessionId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.session(sessionId),
          });
        }
        break;
      case 'note_saved':
        if (sessionId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.sessionNotes(sessionId),
          });
        }
        break;
      case 'session_completed':
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        if (sessionId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.session(sessionId),
          });
        }
        break;
      default:
        break;
    }
  };
}

export { getErrorMessage };
