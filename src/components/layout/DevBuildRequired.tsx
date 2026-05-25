import { StyleSheet, Text, View } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

interface DevBuildRequiredProps {
  feature?: string;
}

export function DevBuildRequired({
  feature = 'Voice cooking with Grace',
}: DevBuildRequiredProps) {
  return (
    <ScreenWrapper edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>Development build required</Text>
        <Text style={styles.body}>
          {feature} uses LiveKit native modules that are not available in Expo
          Go.
        </Text>
        <View style={styles.steps}>
          <Text style={styles.step}>1. Stop Expo Go</Text>
          <Text style={styles.step}>2. Run: npx expo run:ios</Text>
          <Text style={styles.step}>   or: npx expo run:android</Text>
          <Text style={styles.step}>3. Open the dev build on your device</Text>
        </View>
        <Text style={styles.note}>
          Kitchen and login screens work in Expo Go. Voice features need a dev
          build.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  steps: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  step: {
    fontSize: fontSizes.sm,
    fontFamily: 'monospace',
    color: colors.textPrimary,
  },
  note: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
