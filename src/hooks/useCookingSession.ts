import { useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { resolveVoiceSessionId } from '@/lib/voiceSessionId';
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

import type { SessionWithDetails } from '@/types/cooking.types';

function sessionNeedsLiveRefresh(session: SessionWithDetails | undefined): boolean {
  if (!session) {
    return false;
  }

  const isBuilding =
    session.status === 'gathering_prefs' || session.status === 'confirmed';
  const missingRecipeData =
    session.ingredients.length === 0 || session.steps.length === 0;

  return isBuilding && missingRecipeData;
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
    refetchOnMount: 'always',
    refetchInterval: (query) =>
      sessionNeedsLiveRefresh(query.state.data) ? 2500 : false,
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
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const notes = query.state.data;
      if (notes === undefined) {
        return false;
      }
      return notes.length === 0 ? 4000 : false;
    },
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

export function useVoiceActionInvalidation(fallbackSessionId?: string) {
  const queryClient = useQueryClient();
  const fallbackRef = useRef(fallbackSessionId);
  fallbackRef.current = fallbackSessionId;

  return useCallback(
    (
      action: string,
      payload?: Record<string, unknown>,
      actionSessionId?: string,
    ) => {
      const sessionId = resolveVoiceSessionId(
        payload,
        actionSessionId,
        fallbackRef.current,
      );

    const refetchSession = () => {
      if (!sessionId) {
        return;
      }
      void queryClient.refetchQueries({
        queryKey: queryKeys.session(sessionId),
      });
    };

    const refetchNotes = () => {
      if (!sessionId) {
        return;
      }
      void queryClient.refetchQueries({
        queryKey: queryKeys.sessionNotes(sessionId),
      });
    };

    const refetchAll = () => {
      refetchSession();
      refetchNotes();
    };

    switch (action) {
      case 'session_created':
        void queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        refetchAll();
        break;
      case 'tool_called':
        if (sessionId) {
          setTimeout(() => refetchAll(), 1500);
          setTimeout(() => refetchAll(), 4000);
        } else {
          void queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        }
        break;
      case 'ingredient_added':
      case 'ingredients_added':
      case 'step_added':
      case 'steps_added':
      case 'step_advanced':
      case 'step_completed':
      case 'recipe_saved':
      case 'preferences_saved':
      case 'dish_confirmed':
        refetchAll();
        break;
      case 'note_saved':
        refetchNotes();
        refetchSession();
        break;
      case 'session_completed':
        void queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
        refetchAll();
        break;
      default:
        break;
    }
    },
    [queryClient],
  );
}

export { getErrorMessage };
