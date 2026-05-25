import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '@/constants/colors';
import type { VoiceStatus } from '@/types/voice.types';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.View;

const ORB_SIZE = 280;
const SHELL_SIZE = 200;
const CORE_INSET = 0.28;

interface GraceOrbProps {
  status: VoiceStatus;
}

function RippleRing({ delay, active }: { delay: number; active: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: 2000 + delay, easing: Easing.out(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [active, delay, progress]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: SHELL_SIZE,
    height: SHELL_SIZE,
    borderRadius: SHELL_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: interpolate(progress.value, [0, 0.3, 1], [0.6, 0.3, 0]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.8]) },
    ],
  }));

  return <AnimatedView style={style} />;
}

function WaveBar({ index, active }: { index: number; active: boolean }) {
  const height = useSharedValue(8);

  useEffect(() => {
    if (active) {
      const target = [12, 22, 16, 26, 14][index] ?? 16;
      height.value = withRepeat(
        withSequence(
          withTiming(target, { duration: 300 + index * 80 }),
          withTiming(8, { duration: 300 + index * 80 }),
        ),
        -1,
        true,
      );
    } else {
      height.value = withTiming(8, { duration: 200 });
    }
  }, [active, height, index]);

  const style = useAnimatedStyle(() => ({
    width: 4,
    height: height.value,
    borderRadius: 2,
    backgroundColor: colors.surface,
    opacity: 0.85,
  }));

  return <AnimatedView style={style} />;
}

function ConicLayer({
  rotation,
  opacity,
  colors: layerColors,
}: {
  rotation: SharedValue<number>;
  opacity: number;
  colors: string[];
}) {
  const animatedProps = useAnimatedProps(() => ({
    rotation: rotation.value,
  }));

  const cx = SHELL_SIZE / 2;
  const cy = SHELL_SIZE / 2;
  const r = SHELL_SIZE / 2;

  const segments = layerColors.length;
  const paths = Array.from({ length: segments }, (_, i) => {
    const startAngle = (i / segments) * 360;
    const endAngle = ((i + 1) / segments) * 360;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  });

  return (
    <AnimatedG animatedProps={animatedProps} origin={`${cx}, ${cy}`}>
      <Svg width={SHELL_SIZE} height={SHELL_SIZE}>
        {paths.map((d, i) => (
          <Path key={i} d={d} fill={layerColors[i % layerColors.length]} opacity={opacity} />
        ))}
      </Svg>
    </AnimatedG>
  );
}

export function GraceOrb({ status }: GraceOrbProps) {
  const shellRotation = useSharedValue(0);
  const layer1Rotation = useSharedValue(0);
  const layer2Rotation = useSharedValue(0);
  const highlightDrift = useSharedValue(0);
  const glowPulse = useSharedValue(0.6);
  const shellScale = useSharedValue(1);
  const coreFlash = useSharedValue(0);
  const thinkingRing = useSharedValue(0);

  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';
  const isConnecting = status === 'connecting';
  const isThinking = status === 'thinking';
  const isInterrupted = status === 'interrupted';
  const isStalled = status === 'stalled';
  const isIdle = status === 'idle';

  useEffect(() => {
    const speed = isIdle
      ? 20000
      : isStalled
        ? 25000
        : isConnecting
          ? 8000
          : isListening
            ? 5000
            : isSpeaking
              ? 3000
              : isThinking
                ? 6000
                : 10000;

    shellRotation.value = withRepeat(
      withTiming(360, { duration: speed, easing: Easing.linear }),
      -1,
      false,
    );
    layer1Rotation.value = withRepeat(
      withTiming(360, { duration: speed * 0.7, easing: Easing.linear }),
      -1,
      false,
    );
    layer2Rotation.value = withRepeat(
      withTiming(-360, { duration: speed * 0.9, easing: Easing.linear }),
      -1,
      false,
    );
    highlightDrift.value = withRepeat(
      withTiming(360, { duration: speed * 1.5, easing: Easing.linear }),
      -1,
      false,
    );
  }, [
    isConnecting,
    isIdle,
    isListening,
    isSpeaking,
    isStalled,
    isThinking,
    highlightDrift,
    layer1Rotation,
    layer2Rotation,
    shellRotation,
  ]);

  useEffect(() => {
    const pulseDuration = isIdle
      ? 4000
      : isConnecting
        ? 1500
        : isSpeaking
          ? 800
          : isThinking
            ? 1000
            : 2000;

    glowPulse.value = withRepeat(
      withSequence(
        withTiming(isStalled ? 0.4 : 1, { duration: pulseDuration / 2 }),
        withTiming(isStalled ? 0.3 : 0.5, { duration: pulseDuration / 2 }),
      ),
      -1,
      true,
    );
  }, [glowPulse, isConnecting, isIdle, isSpeaking, isStalled, isThinking]);

  useEffect(() => {
    if (isInterrupted) {
      shellScale.value = withSequence(
        withTiming(0.95, { duration: 50 }),
        withTiming(1.05, { duration: 50 }),
        withTiming(1, { duration: 50 }),
      );
      coreFlash.value = withSequence(
        withTiming(1, { duration: 75 }),
        withTiming(0, { duration: 75 }),
      );
    }
  }, [coreFlash, isInterrupted, shellScale]);

  useEffect(() => {
    if (isThinking) {
      thinkingRing.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      thinkingRing.value = 0;
    }
  }, [isThinking, thinkingRing]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [{ scale: interpolate(glowPulse.value, [0.3, 1], [0.9, 1.15]) }],
  }));

  const shellStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${shellRotation.value}deg` },
      { scale: shellScale.value },
    ],
  }));

  const thinkingRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${thinkingRing.value}deg` }],
    opacity: isThinking ? 1 : 0,
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          highlightDrift.value,
          [0, 90, 180, 270, 360],
          [20, -10, -25, 10, 20],
        ),
      },
      {
        translateY: interpolate(
          highlightDrift.value,
          [0, 90, 180, 270, 360],
          [-15, 20, 15, -20, -15],
        ),
      },
    ],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: interpolate(coreFlash.value, [0, 1], [0.9, 1]),
  }));

  const glowColor = isListening
    ? colors.blue
    : isThinking
      ? colors.purple
      : colors.primary;

  const rippleCount =
    status === 'connecting' ? 1 : isListening ? 2 : isSpeaking ? 3 : 0;

  const layer1Colors = [colors.primary, colors.accent, colors.accentLight, '#fbbf24'];
  const layer2Colors = [colors.primaryDark, colors.accent, '#fcd34d', colors.primary];

  return (
    <View style={styles.container}>
      {Array.from({ length: rippleCount }).map((_, i) => (
        <RippleRing key={i} delay={i * 400} active={rippleCount > 0} />
      ))}

      <AnimatedView
        style={[
          styles.glow,
          { backgroundColor: glowColor },
          glowStyle,
        ]}
      />

      <AnimatedView style={[styles.shell, shellStyle]}>
        <View style={styles.shellClip}>
          <ConicLayer rotation={layer1Rotation} opacity={1} colors={layer1Colors} />
          <ConicLayer rotation={layer2Rotation} opacity={0.45} colors={layer2Colors} />

          <AnimatedView style={[styles.highlight, highlightStyle]}>
            <Svg width={80} height={80}>
              <Defs>
                <RadialGradient id="highlight" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
                  <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle cx={40} cy={40} r={40} fill="url(#highlight)" />
            </Svg>
          </AnimatedView>

          <AnimatedView style={[styles.core, coreStyle]}>
            <Svg width={SHELL_SIZE * (1 - CORE_INSET * 2)} height={SHELL_SIZE * (1 - CORE_INSET * 2)}>
              <Defs>
                <RadialGradient id="coreGrad" cx="40%" cy="40%" r="60%">
                  <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                  <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.6" />
                  <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle
                cx={(SHELL_SIZE * (1 - CORE_INSET * 2)) / 2}
                cy={(SHELL_SIZE * (1 - CORE_INSET * 2)) / 2}
                r={(SHELL_SIZE * (1 - CORE_INSET * 2)) / 2}
                fill="url(#coreGrad)"
              />
            </Svg>
          </AnimatedView>

          {isSpeaking && (
            <View style={styles.waveBars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <WaveBar key={i} index={i} active={isSpeaking} />
              ))}
            </View>
          )}
        </View>
      </AnimatedView>

      {isThinking && (
        <AnimatedView style={[styles.thinkingRing, thinkingRingStyle]}>
          <Svg width={ORB_SIZE} height={ORB_SIZE}>
            <Circle
              cx={ORB_SIZE / 2}
              cy={ORB_SIZE / 2}
              r={SHELL_SIZE / 2 + 12}
              stroke={colors.purple}
              strokeWidth={3}
              strokeDasharray="20 12"
              fill="none"
              opacity={0.7}
            />
          </Svg>
        </AnimatedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: SHELL_SIZE + 60,
    height: SHELL_SIZE + 60,
    borderRadius: (SHELL_SIZE + 60) / 2,
    opacity: 0.35,
  },
  shell: {
    width: SHELL_SIZE,
    height: SHELL_SIZE,
    borderRadius: SHELL_SIZE / 2,
    overflow: 'visible',
  },
  shellClip: {
    width: SHELL_SIZE,
    height: SHELL_SIZE,
    borderRadius: SHELL_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  core: {
    position: 'absolute',
    top: SHELL_SIZE * CORE_INSET,
    left: SHELL_SIZE * CORE_INSET,
  },
  waveBars: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  thinkingRing: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
