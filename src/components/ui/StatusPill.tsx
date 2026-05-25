import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { SessionStatus } from '@/types/cooking.types';

interface StatusPillProps {
  status: SessionStatus;
}

const statusConfig: Record<
  SessionStatus,
  { label: string; background: string; text: string }
> = {
  gathering_prefs: {
    label: 'Gathering',
    background: '#fef3c7',
    text: colors.primaryDark,
  },
  confirmed: {
    label: 'Confirmed',
    background: colors.blueLight,
    text: colors.blue,
  },
  cooking: {
    label: 'Cooking',
    background: colors.greenLight,
    text: colors.success,
  },
  completed: {
    label: 'Completed',
    background: colors.surfaceElevated,
    text: colors.textMuted,
  },
  abandoned: {
    label: 'Abandoned',
    background: colors.errorLight,
    text: colors.error,
  },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <View style={[styles.pill, { backgroundColor: config.background }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
});
