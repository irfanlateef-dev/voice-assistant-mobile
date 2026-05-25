import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { formatStepProgress } from '@/lib/formatters';
import type { CookingSession, SessionStatus } from '@/types/cooking.types';

interface SessionCardProps {
  session: CookingSession;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}

const SIDE_SIZE = 48;

const STATUS_COLOR: Record<SessionStatus, string> = {
  gathering_prefs: colors.primaryDark,
  confirmed: colors.blue,
  cooking: colors.success,
  completed: colors.textMuted,
  abandoned: colors.error,
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  gathering_prefs: 'Gathering',
  confirmed: 'Confirmed',
  cooking: 'Cooking',
  completed: 'Completed',
  abandoned: 'Abandoned',
};

export function SessionCard({
  session,
  index,
  onPress,
  onDelete,
}: SessionCardProps) {
  const stepLabel = formatStepProgress(session.currentStep, session.totalSteps);
  const statusLabel = STATUS_LABEL[session.status];
  const statusColor = STATUS_COLOR[session.status];

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={styles.card}>
        <View style={styles.iconSlot}>
          <View style={styles.iconContainer}>
            <Text style={styles.emoji}>🍲</Text>
          </View>
        </View>

        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        >
          <Text style={styles.dishName} numberOfLines={1}>
            {session.dishName}
          </Text>
          <Text style={styles.metaLine} numberOfLines={1}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
            <Text style={styles.stepsText}> · {stepLabel}</Text>
          </Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteSlot,
            pressed && styles.deletePressed,
          ]}
          hitSlop={4}
        >
          <Trash2 size={20} color={colors.error} strokeWidth={2} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: SIDE_SIZE + spacing.sm * 2,
  },
  iconSlot: {
    width: SIDE_SIZE,
    height: SIDE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: spacing.lg,
  },
  iconContainer: {
    width: SIDE_SIZE,
    height: SIDE_SIZE,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    gap: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  dishName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  metaLine: {
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  statusText: {
    fontWeight: fontWeights.semibold,
  },
  stepsText: {
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  deleteSlot: {
    width: SIDE_SIZE,
    height: SIDE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  deletePressed: {
    opacity: 0.65,
  },
});
