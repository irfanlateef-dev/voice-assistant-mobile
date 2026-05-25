import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { CookSessionView } from '@/components/cooking/CookSessionView';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import {
  useCookingSession,
  useSessionNotes,
  useVoiceActionInvalidation,
  getErrorMessage,
} from '@/hooks/useCookingSession';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useVoiceSessionFocus } from '@/hooks/useVoiceSessionFocus';
import { useAppState } from '@/hooks/useAppState';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { normalizeRouteParam } from '@/lib/navigation';

export default function ActiveSessionScreen() {
  const params = useLocalSearchParams<{ sessionId: string | string[] }>();
  const sessionId = normalizeRouteParam(params.sessionId);
  const { isAuthenticated } = useAuth();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useCookingSession(sessionId);
  const { data: notes } = useSessionNotes(sessionId);
  const invalidateAction = useVoiceActionInvalidation(sessionId);

  const handleAction = useCallback(
    (action: string) => {
      invalidateAction(action);
    },
    [invalidateAction],
  );

  const voice = useVoiceAgent({
    sessionId,
    authReady: isAuthenticated,
    onAction: handleAction,
  });

  useVoiceSessionFocus({
    isAuthenticated,
    permissionGranted,
    sessionId,
    connect: voice.connect,
    fullReset: voice.fullReset,
  });

  useAppState({
    onBackground: () => {
      void voice.fullReset();
    },
  });

  useEffect(() => {
    async function requestPermission() {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        setPermissionGranted(true);
      } else {
        setPermissionGranted(false);
      }
    }

    void requestPermission();
  }, []);

  if (!sessionId) {
    return (
      <ScreenWrapper edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Invalid session</Text>
          <Text style={styles.errorText}>No session ID was provided.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (permissionGranted === false) {
    return (
      <ScreenWrapper edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🎤</Text>
          <Text style={styles.errorTitle}>Microphone access required</Text>
          <Text style={styles.errorText}>
            Enable microphone access to cook hands-free with Grace.
          </Text>
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()}
            variant="primary"
          />
        </View>
      </ScreenWrapper>
    );
  }

  if (isLoading || permissionGranted === null) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !session) {
    return (
      <ScreenWrapper edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Could not load session</Text>
          <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
          <Button title="Try Again" onPress={() => refetch()} variant="primary" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <CookSessionView
      session={session}
      notes={notes ?? []}
      voice={voice}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  errorEmoji: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
