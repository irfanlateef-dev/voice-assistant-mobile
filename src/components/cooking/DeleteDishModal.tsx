import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

interface DeleteDishModalProps {
  visible: boolean;
  dishName: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDishModal({
  visible,
  dishName,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteDishModalProps) {
  const [mounted, setMounted] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const dialogOpacity = useSharedValue(0);
  const dialogScale = useSharedValue(0.94);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = withTiming(1, { duration: 180 });
      dialogOpacity.value = withTiming(1, { duration: 180 });
      dialogScale.value = withTiming(1, { duration: 180 });
      return;
    }

    if (!mounted) {
      return;
    }

    backdropOpacity.value = withTiming(0, { duration: 150 });
    dialogOpacity.value = withTiming(0, { duration: 150 });
    dialogScale.value = withTiming(
      0.94,
      { duration: 150 },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [visible, mounted, backdropOpacity, dialogOpacity, dialogScale]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const dialogStyle = useAnimatedStyle(() => ({
    opacity: dialogOpacity.value,
    transform: [{ scale: dialogScale.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        </Animated.View>

        <Animated.View style={[styles.dialog, dialogStyle]}>
          <View style={styles.iconWrap}>
            <Trash2 size={22} color={colors.error} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Delete this dish?</Text>
          <Text style={styles.dishName}>{dishName}</Text>
          <Text style={styles.warning}>
            This removes the session and all cooking progress. This cannot be
            undone.
          </Text>
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="secondary"
              size="md"
              style={styles.button}
              disabled={loading}
            />
            <Button
              title="Delete"
              onPress={onConfirm}
              variant="danger"
              size="md"
              loading={loading}
              style={styles.button}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayDark,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  dishName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  warning: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
