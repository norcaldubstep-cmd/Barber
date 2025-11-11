import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { BarberProfile } from '../../types/barber.types';
import { getBarberProfile } from '../../services/barberService';
import { getUserFavorites, removeFavorite } from '../../services/usersService';
import { useAuthStore } from '../../store/authStore';

export const FavoritesScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<BarberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get favorite barber IDs
      const favoriteIds = await getUserFavorites(user.id);

      // Fetch full barber profiles
      const barberProfiles = await Promise.all(
        favoriteIds.map((id) => getBarberProfile(id))
      );

      // Filter out any null results
      setFavorites(barberProfiles.filter((b) => b !== null) as BarberProfile[]);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (barberId: string) => {
    if (!user) return;

    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this barber from your favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically update UI
              setFavorites(favorites.filter((b) => b.id !== barberId));

              // Remove from Firebase
              await removeFavorite(user.id, barberId);
            } catch (err) {
              console.error('Error removing favorite:', err);
              // Reload favorites to restore state
              loadFavorites();
              Alert.alert('Error', 'Failed to remove favorite. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderBarber = ({ item }: { item: BarberProfile }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('BarberProfile', { barberId: item.id })}
    >
      <Card style={styles.barberCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Avatar
            name={item.displayName}
            size="xl"
            verified={item.isVerified}
            showGradientBorder={item.promotionTier !== 'FREE'}
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Ionicons name="heart" size={24} color={colors.accent.red} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.barberInfo}>
          <Text style={styles.barberName}>{item.displayName}</Text>
          {item.worksAt && (
            <View style={styles.worksAtRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Text style={styles.worksAtText}>{item.worksAt}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color={colors.accent.gold} />
              <Text style={styles.statText}>
                {item.rating} ({item.totalReviews})
              </Text>
            </View>
            {item.distance !== undefined && (
              <View style={styles.stat}>
                <Ionicons name="location" size={16} color={colors.accent.blue} />
                <Text style={styles.statText}>{item.distance.toFixed(1)} mi</Text>
              </View>
            )}
          </View>

          {/* Specialties */}
          {item.specialties && item.specialties.length > 0 && (
            <View style={styles.specialtiesRow}>
              {item.specialties.slice(0, 3).map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
              {item.specialties.length > 3 && (
                <Text style={styles.moreText}>+{item.specialties.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Book Now"
            onPress={() => navigation.navigate('Booking', { barberId: item.id })}
            variant="gradient"
            size="medium"
            style={styles.bookButton}
            icon="calendar"
          />
          <Button
            title="Message"
            onPress={() =>
              navigation.navigate('Chat', {
                participant: {
                  id: item.id,
                  name: item.displayName,
                  isVerified: item.isVerified,
                },
              })
            }
            variant="outline"
            size="medium"
            style={styles.messageButton}
            icon="chatbubble-outline"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Banner */}
      {favorites.length > 0 && (
        <LinearGradient
          colors={['#D4AF37', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsBanner}
        >
          <View style={styles.statsContent}>
            <Ionicons name="heart" size={32} color="#000" />
            <View style={styles.statsText}>
              <Text style={styles.statsCount}>{favorites.length}</Text>
              <Text style={styles.statsLabel}>
                Favorite {favorites.length === 1 ? 'Barber' : 'Barbers'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadFavorites}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      )}

      {/* Favorites List */}
      {!isLoading && favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderBarber}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : !isLoading ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color={colors.text.secondary} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite barbers to quickly book with them again
          </Text>
          <Button
            title="Discover Barbers"
            onPress={() => navigation.navigate('MainTabs', { screen: 'DiscoverTab' })}
            variant="gradient"
            size="medium"
            icon="search"
            style={styles.discoverButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.h2, fontWeight: '700' },
  statsBanner: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  statsContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statsText: { flex: 1 },
  statsCount: { fontSize: 32, fontWeight: '900', color: '#000', marginBottom: 2 },
  statsLabel: { ...textStyles.body, color: 'rgba(0,0,0,0.7)', fontWeight: '600' },
  listContent: { padding: spacing.lg, paddingTop: 0 },
  barberCard: { padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  barberInfo: { alignItems: 'center', marginBottom: spacing.md },
  barberName: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.xs },
  worksAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  worksAtText: { ...textStyles.bodySmall, color: colors.text.secondary },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { ...textStyles.bodySmall, fontWeight: '600' },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  specialtyTag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  specialtyText: { ...textStyles.caption, color: colors.text.primary, fontWeight: '600' },
  moreText: { ...textStyles.caption, color: colors.text.secondary, marginLeft: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  bookButton: { flex: 2 },
  messageButton: { flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  discoverButton: { minWidth: 200 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    ...textStyles.bodySmall,
    color: colors.error,
  },
  retryText: {
    ...textStyles.bodySmall,
    color: colors.accent.gold,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});
