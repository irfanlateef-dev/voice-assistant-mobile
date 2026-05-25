import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { teardownActiveVoiceSession } from '@/lib/voiceSession';

export default function CookLayout() {
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
