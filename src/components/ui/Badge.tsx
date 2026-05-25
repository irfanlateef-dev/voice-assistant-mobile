import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

type BadgeVariant =
  | 'tip'
  | 'substitution'
  | 'preference'
  | 'warning'
  | 'joke_fact'
  | 'default'
  | 'gathering_prefs'
  | 'confirmed'
  | 'cooking'
  | 'completed'
  | 'abandoned';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<
  BadgeVariant,
  { background: string; text: string }
> = {
  tip: { background: '#fef3c7', text: colors.primaryDark },
  substitution: { background: colors.blueLight, text: colors.blue },
  preference: { background: colors.purpleLight, text: colors.purple },
  warning: { background: colors.errorLight, text: colors.error },
  joke_fact: { background: colors.greenLight, text: colors.green },
  default: { background: colors.surfaceElevated, text: colors.textSecondary },
  gathering_prefs: { background: '#fef3c7', text: colors.primaryDark },
  confirmed: { background: colors.blueLight, text: colors.blue },
  cooking: { background: colors.greenLight, text: colors.success },
  completed: { background: colors.surfaceElevated, text: colors.textMuted },
  abandoned: { background: colors.errorLight, text: colors.error },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const palette = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.background },
        style,
      ]}
    >
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    textTransform: 'capitalize',
  },
});
