import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import { EXPO_GO_VOICE_MESSAGE } from '@/lib/livekitSetup';

export function ExpoGoVoiceBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Voice unavailable in Expo Go</Text>
      <Text style={styles.body}>{EXPO_GO_VOICE_MESSAGE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#fef3c7',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
