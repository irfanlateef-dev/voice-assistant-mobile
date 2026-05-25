import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { Ingredient } from '@/types/cooking.types';

interface IngredientChecklistProps {
  ingredients: Ingredient[];
}

function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
  const isAdded = ingredient.status === 'added';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isAdded ? 0.7 : 1, { duration: 300 }),
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={[styles.row, animatedStyle]}
    >
      <View
        style={[
          styles.checkbox,
          isAdded && styles.checkboxAdded,
        ]}
      >
        {isAdded && <Check size={14} color={colors.surface} strokeWidth={3} />}
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.name,
            isAdded && styles.nameAdded,
          ]}
        >
          {ingredient.name}
        </Text>
        <Text style={styles.quantity}>
          {ingredient.quantity} {ingredient.unit}
        </Text>
      </View>
    </Animated.View>
  );
}

export function IngredientChecklist({ ingredients }: IngredientChecklistProps) {
  const sorted = [...ingredients].sort((a, b) => a.sortOrder - b.sortOrder);
  const addedCount = sorted.filter((item) => item.status === 'added').length;

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No ingredients yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {addedCount} of {sorted.length} added
      </Text>
      {sorted.map((ingredient) => (
        <IngredientRow key={ingredient.id} ingredient={ingredient} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxAdded: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
  },
  nameAdded: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  quantity: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
  },
});
