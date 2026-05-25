import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { TranscriptEntry } from '@/types/voice.types';

interface TranscriptFeedProps {
  entries: TranscriptEntry[];
}

function BlinkingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.cursor, style]}>|</Animated.Text>
  );
}

function TranscriptBubble({ entry }: { entry: TranscriptEntry }) {
  const isUser = entry.role === 'user';

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[
        styles.row,
        isUser ? styles.userRow : styles.assistantRow,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={[styles.label, isUser && styles.userLabel]}>
          {isUser ? 'You' : 'Grace'}
        </Text>
        <Text style={[styles.text, isUser && styles.userText]}>
          {entry.text}
          {entry.interim ? <BlinkingCursor /> : null}
        </Text>
      </View>
    </Animated.View>
  );
}

export function TranscriptFeed({ entries }: TranscriptFeedProps) {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    scrollToEnd();
  }, [entries]);

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>💬</Text>
        <Text style={styles.emptyText}>
          Your conversation with Grace will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={scrollToEnd}
      keyboardShouldPersistTaps="handled"
    >
      {entries.map((entry) => (
        <TranscriptBubble key={entry.id} entry={entry} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    flexGrow: 1,
  },
  row: {
    width: '100%',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(254, 243, 199, 0.92)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: colors.border,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  userLabel: {
    color: colors.primaryDark,
  },
  text: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  userText: {
    color: colors.textSecondary,
  },
  cursor: {
    color: colors.primary,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    width: '100%',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 24,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    maxWidth: 280,
  },
});
