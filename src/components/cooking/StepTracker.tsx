import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { Step } from '@/types/cooking.types';

interface StepTrackerProps {
  steps: Step[];
  currentStep?: number;
}

interface StepVisualState {
  isActive: boolean;
  isCompleted: boolean;
}

function resolveStepState(step: Step, currentStep: number): StepVisualState {
  const isCompleted =
    step.status === 'completed' || step.stepNumber < currentStep;
  const isActive =
    !isCompleted &&
    (step.status === 'active' || step.stepNumber === currentStep);

  return { isActive, isCompleted };
}

function StepCircle({
  step,
  visual,
}: {
  step: Step;
  visual: StepVisualState;
}) {
  if (visual.isCompleted) {
    return (
      <View style={[styles.circle, styles.circleCompleted]}>
        <Check size={14} color={colors.surface} strokeWidth={3} />
      </View>
    );
  }

  if (visual.isActive) {
    return (
      <View style={styles.circleActiveWrapper}>
        <View style={styles.circleGlow} />
        <Svg width={36} height={36} style={styles.circleGradient}>
          <Defs>
            <LinearGradient id={`activeGrad-${step.id}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} />
              <Stop offset="1" stopColor={colors.accent} />
            </LinearGradient>
          </Defs>
          <Rect width={36} height={36} rx={18} fill={`url(#activeGrad-${step.id})`} />
        </Svg>
        <Text style={styles.circleNumberActive}>{step.stepNumber}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.circle, styles.circleUpcoming]}>
      <Text style={styles.circleNumber}>{step.stepNumber}</Text>
    </View>
  );
}

function CompletedInstruction({ text }: { text: string }) {
  return (
    <Text style={[styles.instruction, styles.instructionCompleted]} numberOfLines={3}>
      {text}
    </Text>
  );
}

function StepRow({
  step,
  visual,
  isLast,
  index,
}: {
  step: Step;
  visual: StepVisualState;
  isLast: boolean;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={styles.row}
    >
      <View style={styles.timeline}>
        <StepCircle step={step} visual={visual} />
        {!isLast && (
          <View
            style={[styles.line, visual.isCompleted && styles.lineCompleted]}
          />
        )}
      </View>
      <View style={styles.content}>
        {visual.isCompleted ? (
          <CompletedInstruction text={step.instruction} />
        ) : (
          <Text
            style={[
              styles.instruction,
              visual.isActive && styles.instructionActive,
            ]}
            numberOfLines={visual.isActive ? undefined : 2}
          >
            {step.instruction}
          </Text>
        )}
        {visual.isActive && step.durationMinutes != null && (
          <Text style={styles.duration}>{step.durationMinutes} min</Text>
        )}
      </View>
    </Animated.View>
  );
}

export function StepTracker({ steps, currentStep = 1 }: StepTrackerProps) {
  const sorted = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Steps will appear as Grace plans your recipe
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sorted.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          visual={resolveStepState(step, currentStep)}
          isLast={index === sorted.length - 1}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 36,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleUpcoming: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleCompleted: {
    backgroundColor: colors.success,
  },
  circleActiveWrapper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
  circleGradient: {
    position: 'absolute',
  },
  circleNumber: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
  },
  circleNumberActive: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.surface,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  instruction: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
    lineHeight: 22,
  },
  instructionActive: {
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  instructionCompleted: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    textDecorationColor: colors.success,
    color: colors.textMuted,
  },
  duration: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
    marginTop: spacing.xs,
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
