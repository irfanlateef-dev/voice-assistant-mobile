import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';

function AuthBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="authGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#fef3c7" stopOpacity="0.6" />
          <Stop offset="0.5" stopColor={colors.background} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.background} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#authGrad)" />
    </Svg>
  );
}

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent />
      <AuthBackground />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
