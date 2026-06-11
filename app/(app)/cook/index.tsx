import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import { CookSessionView } from '@/components/cooking/CookSessionView';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVoiceSessionFocus } from '@/hooks/useVoiceSessionFocus';
import { useAppState } from '@/hooks/useAppState';
import { useAuth } from '@/hooks/useAuth';
import { useCookVoice } from '@/providers/CookVoiceProvider';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

export default function NewDishScreen() {
  const { isAuthenticated } = useAuth();
  const { session, notes, voice, isNewSession, fullReset } = useCookVoice();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useVoiceSessionFocus({
    isAuthenticated,
    permissionGranted,
    isConnected: voice.isConnected,
    isConnecting: voice.status === 'connecting',
    connect: voice.connect,
  });

  useAppState({
    onBackground: () => {
      void fullReset();
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

  if (permissionGranted === null) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Preparing microphone...</Text>
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
            HomeChef AI needs your microphone so Grace can hear you and guide
            you through recipes hands-free.
          </Text>
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()}
            variant="primary"
            style={styles.settingsButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <CookSessionView
      session={session}
      notes={notes}
      voice={voice}
      isNewSession={isNewSession}
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
  settingsButton: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
});
