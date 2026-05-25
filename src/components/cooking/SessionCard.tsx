import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import { StatusPill } from '@/components/ui/StatusPill';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { formatRelativeTime, formatStepProgress } from '@/lib/formatters';
import type { CookingSession } from '@/types/cooking.types';

interface SessionCardProps {
  session: CookingSession;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}

export function SessionCard({
  session,
  index,
  onPress,
  onDelete,
}: SessionCardProps) {
  const stepLabel = formatStepProgress(session.currentStep, session.totalSteps);
  const timeLabel = formatRelativeTime(session.updatedAt);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <View style={styles.card}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.mainPress, pressed && styles.pressed]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>🍲</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.dishName} numberOfLines={1}>
              {session.dishName}
            </Text>

            <View style={styles.metaRow}>
              <StatusPill status={session.status} />
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {stepLabel}
              </Text>
            </View>

            <Text style={styles.updated}>Updated {timeLabel}</Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.continueText}>Open</Text>
            <ChevronRight size={16} color={colors.surface} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.buttonPressed,
            ]}
            hitSlop={6}
          >
            <Trash2 size={17} color={colors.error} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  mainPress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.94,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    paddingTop: 2,
  },
  dishName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaDot: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  metaText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  updated: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    minHeight: 36,
  },
  continueText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.surface,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.12)',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
