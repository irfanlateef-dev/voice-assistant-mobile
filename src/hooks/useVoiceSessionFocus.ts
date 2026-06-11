import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { isExpoGo } from '@/lib/livekitSetup';

interface UseVoiceSessionFocusOptions {
  isAuthenticated: boolean;
  permissionGranted: boolean | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
}

export function useVoiceSessionFocus({
  isAuthenticated,
  permissionGranted,
  isConnected,
  isConnecting,
  connect,
}: UseVoiceSessionFocusOptions): void {
  const connectRef = useRef(connect);
  connectRef.current = connect;

  const isConnectedRef = useRef(isConnected);
  isConnectedRef.current = isConnected;

  const isConnectingRef = useRef(isConnecting);
  isConnectingRef.current = isConnecting;

  useFocusEffect(
    useCallback(() => {
      const canConnect =
        permissionGranted === true &&
        !isExpoGo() &&
        isAuthenticated &&
        !isConnectedRef.current &&
        !isConnectingRef.current;

      if (canConnect) {
        void connectRef.current();
      }

      return undefined;
    }, [isAuthenticated, permissionGranted]),
  );
}
