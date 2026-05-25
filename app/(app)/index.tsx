import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChefHat, Plus } from 'lucide-react-native';
import { openCookSession, openNewCookSession } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { DeleteDishModal } from '@/components/cooking/DeleteDishModal';
import { SessionCard } from '@/components/cooking/SessionCard';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import {
  useCookingSessions,
  useDeleteSession,
  getErrorMessage,
} from '@/hooks/useCookingSession';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontSizes, fontWeights } from '@/constants/typography';
import type { CookingSession } from '@/types/cooking.types';

export default function KitchenScreen() {
  const { user, logout } = useAuth();
  const { data: sessions, isLoading, isError, error, refetch, isRefetching } =
    useCookingSessions();
  const deleteMutation = useDeleteSession();
  const [deleteTarget, setDeleteTarget] = useState<CookingSession | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteMutation, deleteTarget]);

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🍲</Text>
          </View>
          <Text style={styles.logoText}>HomeChef AI</Text>
        </View>
        <View style={styles.userRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name ?? 'Chef'}
          </Text>
          <Pressable onPress={() => logout()} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Kitchen</Text>
        <Text style={styles.subtitle}>
          Tap a dish to continue or start something new
        </Text>
      </View>

      {isLoading && (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <LoadingSkeleton
              key={i}
              width="100%"
              height={72}
              borderRadius={borderRadius.lg}
              style={styles.skeleton}
            />
          ))}
        </View>
      )}

      {isError && (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{getErrorMessage(error)}</Text>
          <Button title="Try Again" onPress={() => refetch()} variant="secondary" />
        </View>
      )}

      {!isLoading && !isError && sessions?.length === 0 && (
        <View style={styles.empty}>
          <ChefHat size={64} color={colors.textMuted} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Nothing cooking yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first dish and let Grace guide you
          </Text>
          <Button
            title="Start your first dish"
            onPress={() => openNewCookSession()}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      )}

      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          style={styles.listFlex}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item, index }) => (
            <SessionCard
              session={item}
              index={index}
              onPress={() => openCookSession(item.id)}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => openNewCookSession()}
      >
        <Plus size={28} color={colors.surface} strokeWidth={2.5} />
      </Pressable>

      <DeleteDishModal
        visible={Boolean(deleteTarget)}
        dishName={deleteTarget?.dishName ?? ''}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '50%',
  },
  userName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  signOut: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  signOutText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 108,
    alignItems: 'stretch',
  },
  skeleton: {
    marginBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
