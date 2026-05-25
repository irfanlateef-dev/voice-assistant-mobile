import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Mic, MicOff, PhoneOff, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { getVoiceStatusLabel } from '@/lib/formatters';
import type { VoiceStatus } from '@/types/voice.types';

interface VoiceControlBarProps {
  status: VoiceStatus;
  isConnected: boolean;
  isMuted: boolean;
  isStalled: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onToggleMute: () => void;
}

export function VoiceControlBar({
  status,
  isConnected,
  isMuted,
  isStalled,
  onConnect,
  onDisconnect,
  onReconnect,
  onToggleMute,
}: VoiceControlBarProps) {
  const insets = useSafeAreaInsets();
  const muteScale = useSharedValue(1);

  const muteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: muteScale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
    >
      <Animated.View style={muteAnimatedStyle}>
        <Pressable
          onPress={onToggleMute}
          disabled={!isConnected}
          onPressIn={() => {
            muteScale.value = withSpring(0.92);
          }}
          onPressOut={() => {
            muteScale.value = withSpring(1);
          }}
          style={[
            styles.muteButton,
            !isConnected && styles.disabled,
          ]}
        >
          {isMuted ? (
            <MicOff size={20} color={colors.error} />
          ) : (
            <Mic size={20} color={colors.textPrimary} />
          )}
        </Pressable>
      </Animated.View>

      <View style={styles.center}>
        {isStalled ? (
          <View style={styles.stalledActions}>
            <Button
              title="Reconnect"
              onPress={onReconnect}
              variant="danger"
              size="md"
              style={styles.reconnectButton}
            />
            <Button
              title="End Session"
              onPress={onDisconnect}
              variant="secondary"
              size="sm"
            />
          </View>
        ) : (
          <Button
            title={isConnected ? 'End Session' : 'Connect to Grace'}
            onPress={isConnected ? onDisconnect : onConnect}
            variant="primary"
            size="md"
            style={styles.mainButton}
          />
        )}
      </View>

      <View style={styles.statusContainer}>
        {isStalled && <RefreshCw size={14} color={colors.error} />}
        <Text
          style={[
            styles.statusText,
            isStalled && { color: colors.error },
          ]}
          numberOfLines={2}
        >
          {getVoiceStatusLabel(status)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  mainButton: {
    minWidth: 180,
  },
  stalledActions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  reconnectButton: {
    minWidth: 160,
  },
  statusContainer: {
    width: 72,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
