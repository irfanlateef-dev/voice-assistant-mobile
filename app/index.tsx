import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { GraceOrb } from '@/components/voice/GraceOrb';
import { colors } from '@/constants/colors';
import * as secureStorage from '@/lib/secureStorage';

export default function IndexScreen() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = await secureStorage.getItem();
      if (token) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/login');
      }
      setChecking(false);
    }

    void checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bgGrad" cx="50%" cy="30%" r="70%">
            <Stop offset="0" stopColor="#fef3c7" stopOpacity="0.8" />
            <Stop offset="1" stopColor={colors.background} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      </Svg>
      {checking && (
        <>
          <GraceOrb status="idle" />
          <ActivityIndicator
            style={styles.loader}
            color={colors.primary}
            size="small"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
