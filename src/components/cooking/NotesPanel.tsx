import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { Note, NoteType } from '@/types/cooking.types';

interface NotesPanelProps {
  notes: Note[];
}

const noteEmojis: Record<NoteType, string> = {
  tip: '💡',
  substitution: '🔄',
  preference: '⭐',
  warning: '⚠️',
  joke_fact: '😄',
};

const noteLabels: Record<NoteType, string> = {
  tip: 'Tip',
  substitution: 'Substitution',
  preference: 'Preference',
  warning: 'Warning',
  joke_fact: 'Fun Fact',
};

function NoteCard({ note, index }: { note: Note; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify()}
      style={styles.card}
    >
      <View style={styles.header}>
        <Badge label={noteLabels[note.noteType]} variant={note.noteType} />
        <Text style={styles.emoji}>{noteEmojis[note.noteType]}</Text>
      </View>
      <Text style={styles.content}>{note.content}</Text>
    </Animated.View>
  );
}

export function NotesPanel({ notes }: NotesPanelProps) {
  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Grace&apos;s tips and notes will show up here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sorted.map((note, index) => (
        <NoteCard key={note.id} note={note} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 20,
  },
  content: {
    fontSize: fontSizes.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  empty: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
