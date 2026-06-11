import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { CookVoiceProvider } from '@/providers/CookVoiceProvider';
import { teardownActiveVoiceSession } from '@/lib/voiceSession';

function CookStack() {
  useFocusEffect(
    useCallback(() => {
      return () => {
        void teardownActiveVoiceSession();
      };
    }, []),
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[sessionId]" />
    </Stack>
  );
}

export default function CookLayout() {
  return (
    <CookVoiceProvider>
      <CookStack />
    </CookVoiceProvider>
  );
}
