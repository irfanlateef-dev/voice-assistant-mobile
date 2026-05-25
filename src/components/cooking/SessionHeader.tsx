import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { StatusPill } from '@/components/ui/StatusPill';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { CookingSession } from '@/types/cooking.types';

interface SessionHeaderProps {
  session: CookingSession;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const progress =
    session.totalSteps > 0
      ? Math.min(session.currentStep / session.totalSteps, 1)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.dishName} numberOfLines={1}>
          {session.dishName}
        </Text>
        <StatusPill status={session.status} />
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.primary} />
                <Stop offset="1" stopColor={colors.accent} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#progressGrad)" rx={4} />
          </Svg>
        </View>
      </View>
      <Text style={styles.progressLabel}>
        Step {Math.min(session.currentStep, session.totalSteps)} of{' '}
        {session.totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dishName: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
