import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { isExpoGo } from '@/lib/livekitSetup';

interface UseVoiceSessionFocusOptions {
  isAuthenticated: boolean;
  permissionGranted: boolean | null;
  sessionId?: string;
  connect: () => Promise<void>;
  fullReset: () => Promise<void>;
}

export function useVoiceSessionFocus({
  isAuthenticated,
  permissionGranted,
  sessionId,
  connect,
  fullReset,
}: UseVoiceSessionFocusOptions): void {
  const connectRef = useRef(connect);
  const fullResetRef = useRef(fullReset);
  connectRef.current = connect;
  fullResetRef.current = fullReset;

  useFocusEffect(
    useCallback(() => {
      const canConnect =
        permissionGranted === true &&
        !isExpoGo() &&
        isAuthenticated &&
        (sessionId === undefined || Boolean(sessionId));

      if (!canConnect) {
        return () => {
          void fullResetRef.current();
        };
      }

      void connectRef.current();

      return () => {
        void fullResetRef.current();
      };
    }, [isAuthenticated, permissionGranted, sessionId]),
  );
}
