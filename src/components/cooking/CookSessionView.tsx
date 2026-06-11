import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GraceOrb } from '@/components/voice/GraceOrb';
import { VoiceControlBar } from '@/components/voice/VoiceControlBar';
import { TranscriptFeed } from '@/components/voice/TranscriptFeed';
import { IngredientChecklist } from '@/components/cooking/IngredientChecklist';
import { StepTracker } from '@/components/cooking/StepTracker';
import { NotesPanel } from '@/components/cooking/NotesPanel';
import { SessionHeader } from '@/components/cooking/SessionHeader';
import { NewSessionHeader } from '@/components/cooking/NewSessionHeader';
import { CookEmptyPanel } from '@/components/cooking/CookEmptyPanel';
import { ExpoGoVoiceBanner } from '@/components/layout/ExpoGoVoiceBanner';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { isExpoGo } from '@/lib/livekitSetup';
import type { Ingredient, Note, SessionWithDetails, Step } from '@/types/cooking.types';
import type { TranscriptEntry, VoiceStatus } from '@/types/voice.types';

export type CookTabKey = 'grace' | 'ingredients' | 'steps' | 'notes';

const TABS: { key: CookTabKey; label: string }[] = [
  { key: 'grace', label: 'Grace' },
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'steps', label: 'Steps' },
  { key: 'notes', label: 'Notes' },
];

export interface CookVoiceControls {
  status: VoiceStatus;
  transcript: TranscriptEntry[];
  connectError: string | null;
  isConnected: boolean;
  isMuted: boolean;
  isStalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  toggleMute: () => Promise<void>;
}

interface CookSessionViewProps {
  session: SessionWithDetails | null;
  notes: Note[];
  voice: CookVoiceControls;
  isNewSession?: boolean;
}

export function CookSessionView({
  session,
  notes,
  voice,
  isNewSession = false,
}: CookSessionViewProps) {
  const [activeTab, setActiveTab] = useState<CookTabKey>('grace');
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const tabWidth = tabBarWidth / TABS.length;

  useEffect(() => {
    const tabIndex = TABS.findIndex((tab) => tab.key === activeTab);
    indicatorX.value = withSpring(tabIndex * tabWidth, {
      damping: 20,
      stiffness: 240,
    });
  }, [activeTab, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth || 0,
  }));

  const handleTabBarLayout = (event: LayoutChangeEvent) => {
    setTabBarWidth(event.nativeEvent.layout.width);
  };

  const ingredients: Ingredient[] = session?.ingredients ?? [];
  const steps: Step[] = session?.steps ?? [];
  const prevIngredientCount = useRef(0);

  useEffect(() => {
    const hadNone = prevIngredientCount.current === 0;
    const hasSome = ingredients.length > 0;

    if (hadNone && hasSome && activeTab === 'grace') {
      setActiveTab('ingredients');
    }

    prevIngredientCount.current = ingredients.length;
  }, [ingredients.length, activeTab]);

  useEffect(() => {
    if (session?.status === 'confirmed' && activeTab === 'grace' && ingredients.length > 0) {
      setActiveTab('ingredients');
    }
  }, [session?.status, ingredients.length, activeTab]);

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      {session ? <SessionHeader session={session} /> : <NewSessionHeader />}

      <View style={styles.tabBar} onLayout={handleTabBarLayout}>
        {tabBarWidth > 0 && (
          <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
        )}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'grace' ? (
        <View style={styles.graceTab}>
          <View style={styles.orbBackground} pointerEvents="none">
            <View style={styles.orbScale}>
              <GraceOrb status={voice.status} />
            </View>
          </View>

          {isExpoGo() && (
            <View style={styles.bannerWrap}>
              <ExpoGoVoiceBanner />
            </View>
          )}

          <TranscriptFeed entries={voice.transcript} />

          {voice.connectError && (
            <Text style={styles.connectError}>{voice.connectError}</Text>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'ingredients' &&
            (ingredients.length > 0 ? (
              <IngredientChecklist ingredients={ingredients} />
            ) : (
              <CookEmptyPanel
                emoji="🥕"
                title="No ingredients yet"
                subtitle={
                  isNewSession
                    ? 'Chat with Grace — she will add ingredients once you choose a dish.'
                    : 'Ingredients will appear here as Grace plans your recipe.'
                }
              />
            ))}

          {activeTab === 'steps' &&
            (steps.length > 0 ? (
              <StepTracker steps={steps} currentStep={session?.currentStep ?? 1} />
            ) : (
              <CookEmptyPanel
                emoji="👩‍🍳"
                title="No steps yet"
                subtitle={
                  isNewSession
                    ? 'Steps will show up after Grace confirms what you are cooking.'
                    : 'Cooking steps will appear here once your recipe is ready.'
                }
              />
            ))}

          {activeTab === 'notes' &&
            (notes.length > 0 ? (
              <NotesPanel notes={notes} />
            ) : (
              <CookEmptyPanel
                emoji="📝"
                title="No notes yet"
                subtitle="Tips, substitutions, and fun facts from Grace will appear here."
              />
            ))}
        </ScrollView>
      )}

      <VoiceControlBar
        status={voice.status}
        isConnected={voice.isConnected}
        isMuted={voice.isMuted}
        isStalled={voice.isStalled}
        onConnect={voice.connect}
        onDisconnect={voice.disconnect}
        onReconnect={voice.reconnect}
        onToggleMute={voice.toggleMute}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 140,
    flexGrow: 1,
  },
  graceTab: {
    flex: 1,
    width: '100%',
    position: 'relative',
    paddingBottom: 120,
  },
  orbBackground: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.22,
  },
  orbScale: {
    transform: [{ scale: 1.35 }],
  },
  bannerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    zIndex: 1,
  },
  connectError: {
    fontSize: fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 1,
  },
});
