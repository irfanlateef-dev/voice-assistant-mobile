import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const sizeStyles: Record<
  ButtonSize,
  { paddingVertical: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: fontSizes.sm },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: fontSizes.base },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, fontSize: fontSizes.md },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;
  const sizeStyle = sizeStyles[size];
  const variantStyles = getVariantStyles(variant);

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        style={[
          styles.base,
          {
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            opacity: isDisabled ? 0.6 : 1,
          },
          variantStyles.container,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variantStyles.spinnerColor}
            size="small"
          />
        ) : (
          <Text
            style={[
              styles.text,
              { fontSize: sizeStyle.fontSize, color: variantStyles.textColor },
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        container: styles.primaryContainer,
        textColor: colors.surface,
        spinnerColor: colors.surface,
      };
    case 'secondary':
      return {
        container: styles.secondaryContainer,
        textColor: colors.textPrimary,
        spinnerColor: colors.primary,
      };
    case 'danger':
      return {
        container: styles.dangerContainer,
        textColor: colors.surface,
        spinnerColor: colors.surface,
      };
    case 'ghost':
      return {
        container: styles.ghostContainer,
        textColor: colors.primary,
        spinnerColor: colors.primary,
      };
  }
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: fontWeights.semibold,
  },
});
