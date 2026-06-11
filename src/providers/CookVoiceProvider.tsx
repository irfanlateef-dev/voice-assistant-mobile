import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  useCookingSession,
  useSessionNotes,
  useVoiceActionInvalidation,
} from '@/hooks/useCookingSession';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { parseCookSessionIdFromPath } from '@/lib/cookRoute';
import { discoverLatestActiveSession } from '@/lib/discoverCookSession';
import { queryClient, queryKeys } from '@/lib/queryClient';
import { resolveVoiceSessionId } from '@/lib/voiceSessionId';
import * as cookingService from '@/services/cooking.service';
import type { CookVoiceControls } from '@/components/cooking/CookSessionView';
import type { Note, SessionWithDetails } from '@/types/cooking.types';

/** Only these actions may attempt API session discovery (never on tool_called). */
const DISCOVER_ON_ACTION = new Set([
  'session_created',
  'recipe_saved',
  'dish_confirmed',
]);

interface CookVoiceContextValue {
  sessionId: string | undefined;
  session: SessionWithDetails | null;
  notes: Note[];
  voice: CookVoiceControls;
  isNewSession: boolean;
  fullReset: () => Promise<void>;
}

const CookVoiceContext = createContext<CookVoiceContextValue | null>(null);

export function CookVoiceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routeSessionId = parseCookSessionIdFromPath(pathname);
  const { isAuthenticated } = useAuth();
  const [discoveredSessionId, setDiscoveredSessionId] = useState<
    string | undefined
  >();

  // Voice token uses route id only — discovering a session must not reconnect LiveKit.
  const voiceSessionId = routeSessionId;
  const dataSessionId = routeSessionId ?? discoveredSessionId;

  const dataSessionIdRef = useRef(dataSessionId);
  dataSessionIdRef.current = dataSessionId;

  const voiceStartedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!routeSessionId) {
      voiceStartedAtRef.current = Date.now();
      setDiscoveredSessionId(undefined);
    }
  }, [routeSessionId]);

  const invalidateAction = useVoiceActionInvalidation(dataSessionId);

  const refetchSessionData = useCallback((targetSessionId: string) => {
    void queryClient.refetchQueries({
      queryKey: queryKeys.session(targetSessionId),
    });
    void queryClient.refetchQueries({
      queryKey: queryKeys.sessionNotes(targetSessionId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
  }, []);

  const attachSessionData = useCallback(
    async (targetSessionId: string) => {
      if (!targetSessionId) {
        return;
      }

      setDiscoveredSessionId((current) => current ?? targetSessionId);

      await queryClient.prefetchQuery({
        queryKey: queryKeys.session(targetSessionId),
        queryFn: async () => {
          const response = await cookingService.getSession(targetSessionId);
          return response.session;
        },
      });

      refetchSessionData(targetSessionId);
    },
    [refetchSessionData],
  );

  const tryDiscoverSession = useCallback(async () => {
    if (routeSessionId || dataSessionIdRef.current) {
      return;
    }

    const session = await discoverLatestActiveSession(
      voiceStartedAtRef.current,
    );
    if (session?.id) {
      await attachSessionData(session.id);
    }
  }, [attachSessionData, routeSessionId]);

  const handleAction = useCallback(
    (
      action: string,
      payload?: Record<string, unknown>,
      actionSessionId?: string,
    ) => {
      const resolvedId = resolveVoiceSessionId(
        payload,
        actionSessionId,
        dataSessionIdRef.current,
      );

      if (resolvedId) {
        void attachSessionData(resolvedId);
      } else if (!routeSessionId && DISCOVER_ON_ACTION.has(action)) {
        void tryDiscoverSession();
      }

      invalidateAction(action, payload, actionSessionId ?? resolvedId);

      if (
        resolvedId &&
        (action === 'session_created' ||
          action === 'recipe_saved' ||
          action === 'dish_confirmed' ||
          action === 'steps_added' ||
          action === 'ingredients_added')
      ) {
        for (const delay of [800, 2000, 4500]) {
          setTimeout(() => refetchSessionData(resolvedId), delay);
        }
      }
    },
    [
      attachSessionData,
      invalidateAction,
      refetchSessionData,
      routeSessionId,
      tryDiscoverSession,
    ],
  );

  const voiceAgent = useVoiceAgent({
    sessionId: voiceSessionId,
    authReady: isAuthenticated,
    onAction: handleAction,
  });

  const { data: session } = useCookingSession(dataSessionId);
  const { data: notes } = useSessionNotes(dataSessionId);

  const voice: CookVoiceControls = useMemo(
    () => ({
      status: voiceAgent.status,
      transcript: voiceAgent.transcript,
      connectError: voiceAgent.connectError,
      isConnected: voiceAgent.isConnected,
      isMuted: voiceAgent.isMuted,
      isStalled: voiceAgent.isStalled,
      connect: voiceAgent.connect,
      disconnect: voiceAgent.disconnect,
      reconnect: voiceAgent.reconnect,
      toggleMute: voiceAgent.toggleMute,
    }),
    [
      voiceAgent.status,
      voiceAgent.transcript,
      voiceAgent.connectError,
      voiceAgent.isConnected,
      voiceAgent.isMuted,
      voiceAgent.isStalled,
      voiceAgent.connect,
      voiceAgent.disconnect,
      voiceAgent.reconnect,
      voiceAgent.toggleMute,
    ],
  );

  const value = useMemo(
    () => ({
      sessionId: dataSessionId,
      session: session ?? null,
      notes: notes ?? [],
      voice,
      isNewSession: !routeSessionId && !session,
      fullReset: voiceAgent.fullReset,
    }),
    [dataSessionId, routeSessionId, session, notes, voice, voiceAgent.fullReset],
  );

  return (
    <CookVoiceContext.Provider value={value}>{children}</CookVoiceContext.Provider>
  );
}

export function useCookVoice(): CookVoiceContextValue {
  const context = useContext(CookVoiceContext);
  if (!context) {
    throw new Error('useCookVoice must be used within CookVoiceProvider');
  }
  return context;
}
