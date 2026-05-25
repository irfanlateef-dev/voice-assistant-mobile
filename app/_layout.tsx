import '@/lib/livekitPolyfills';
import '../global.css';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/lib/queryClient';
import * as secureStorage from '@/lib/secureStorage';
import { setupLiveKit } from '@/lib/livekitSetup';
import { useAuthStore } from '@/stores/authStore';
import * as authService from '@/services/auth.service';
import { colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may already be hidden
});

const STARTUP_TIMEOUT_MS = 8_000;

export default function RootLayout() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const [ready, setReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const fontsReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      await setupLiveKit();

      try {
        const token = await secureStorage.getItem();
        if (token) {
          try {
            const me = await Promise.race([
              authService.getMe(),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 5_000),
              ),
            ]);
            if (!cancelled) {
              setAuth(token, me.user);
            }
          } catch {
            await secureStorage.removeItem();
            if (!cancelled) {
              useAuthStore.getState().clearAuth();
            }
          }
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
          setReady(true);
        }
      }
    }

    void prepare();

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setHydrated(true);
        setReady(true);
      }
    }, STARTUP_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [setAuth, setHydrated]);

  useEffect(() => {
    if (fontsReady && ready) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady, ready]);

  useEffect(() => {
    const fallback = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, STARTUP_TIMEOUT_MS + 1_000);

    return () => clearTimeout(fallback);
  }, []);

  if (!fontsReady || !ready) {
    return <View style={styles.splash} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
