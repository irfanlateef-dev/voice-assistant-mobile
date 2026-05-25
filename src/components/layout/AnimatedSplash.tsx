import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GraceOrb } from '@/components/voice/GraceOrb';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';

export function AnimatedSplash() {
  const taglineOpacity = useSharedValue(0.6);

  useEffect(() => {
    taglineOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 }),
      ),
      -1,
      true,
    );
  }, [taglineOpacity]);

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.orbWrap}>
        <GraceOrb status="connecting" />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.brandBlock}>
        <Text style={styles.title}>HomeChef AI</Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Your kitchen companion, Grace
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  orbWrap: {
    marginBottom: spacing.xxxl,
    transform: [{ scale: 0.85 }],
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
