import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { BarberProfile } from '../../types/barber.types';
import { getNearbyBarbers, getTopRatedBarbers, getBarberProfile } from '../../services/barberService';
import { getUserFavorites } from '../../services/usersService';
import { getLocationOrDefault } from '../../services/locationService';

export const ClientHomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [nearbyBarbers, setNearbyBarbers] = useState<BarberProfile[]>([]);
  const [favoriteBarbers, setFavoriteBarbers] = useState<BarberProfile[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (user && userLocation) {
      loadData();
    }
  }, [user, userLocation]);

  const loadLocation = async (forceRefresh = false) => {
    try {
      // Get location (cached, current, or default)
      const location = await getLocationOrDefault(forceRefresh);
      setUserLocation(location);
    } catch (err) {
      console.error('Error loading location:', err);
      // Even if there's an error, getLocationOrDefault should return default location
      const location = await getLocationOrDefault();
      setUserLocation(location);
    }
  };

  const loadData = async () => {
    if (!user || !userLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load nearby barbers using real location
      const nearby = await getNearbyBarbers(
        userLocation.latitude,
        userLocation.longitude,
        25,
        3
      );
      setNearbyBarbers(nearby);

      // Load user favorites
      const favoriteIds = await getUserFavorites(user.id);
      const favorites = await Promise.all(
        favoriteIds.slice(0, 2).map((id) => getBarberProfile(id))
      );
      setFavoriteBarbers(favorites.filter((b) => b !== null) as BarberProfile[]);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Force refresh location to get fresh GPS reading
    await loadLocation(true);
    await loadData();
    setRefreshing(false);
  };

  const renderQuickAction = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    color: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient colors={[color, color]} style={styles.quickActionGradient}>
        <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBarber = ({ item }: { item: BarberProfile }) => (
    <TouchableOpacity
      style={styles.barberCard}
      onPress={() => navigation.navigate('BarberProfile', { barberId: item.id })}
      activeOpacity={0.9}
    >
      <Avatar
        name={item.displayName}
        size="lg"
        verified={item.isVerified}
        showGradientBorder={item.promotionTier !== 'FREE'}
      />
      <View style={styles.barberInfo}>
        <Text style={styles.barberName} numberOfLines={1}>
          {item.displayName}
        </Text>
        {item.worksAt && (
          <Text style={styles.barberBusiness} numberOfLines={1}>
            {item.worksAt}
          </Text>
        )}
        <View style={styles.barberMeta}>
          <Ionicons name="star" size={14} color={colors.accent.gold} />
          <Text style={styles.barberRating}>{item.rating}</Text>
          {item.distance !== undefined && (
            <>
              <Text style={styles.barberDot}>•</Text>
              <Text style={styles.barberDistance}>{item.distance.toFixed(1)} mi</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
            <Text style={styles.loadingText}>Loading your barbers...</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.firstName}!</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction(
              'search',
              'Find Barbers',
              colors.accent.gold,
              () => navigation.navigate('DiscoverTab')
            )}
            {renderQuickAction(
              'calendar',
              'My Bookings',
              colors.accent.blue,
              () => navigation.navigate('BookingsTab')
            )}
            {renderQuickAction(
              'heart',
              'Favorites',
              colors.accent.red,
              () => navigation.navigate('Favorites')
            )}
            {renderQuickAction(
              'location',
              'Nearby',
              colors.success,
              () => navigation.navigate('DiscoverTab')
            )}
          </View>
        </View>

        {/* Upcoming Booking Banner */}
        <Card style={styles.upcomingCard}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upcomingGradient}
          >
            <View style={styles.upcomingContent}>
              <View style={styles.upcomingIcon}>
                <Ionicons name="calendar" size={32} color="#000" />
              </View>
              <View style={styles.upcomingText}>
                <Text style={styles.upcomingTitle}>Next Appointment</Text>
                <Text style={styles.upcomingDetails}>Tomorrow at 2:00 PM</Text>
                <Text style={styles.upcomingBarber}>with Mike the Barber</Text>
              </View>
            </View>
            <Button
              title="View Details"
              onPress={() => navigation.navigate('BookingsTab')}
              variant="outline"
              size="small"
              style={styles.upcomingButton}
            />
          </LinearGradient>
        </Card>

        {/* Favorites */}
        {favoriteBarbers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Favorites</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={favoriteBarbers}
              renderItem={renderBarber}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.barbersList}
            />
          </View>
        )}

        {/* Nearby Barbers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Barbers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={nearbyBarbers}
            renderItem={renderBarber}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barbersList}
          />
        </View>

        {/* Featured Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Styles</Text>
          <Card style={styles.featuredCard}>
            <View style={styles.featuredContent}>
              <Ionicons name="cut" size={48} color={colors.accent.gold} />
              <Text style={styles.featuredTitle}>Fresh Fade Inspiration</Text>
              <Text style={styles.featuredSubtitle}>
                Check out the latest fade styles from top barbers in your area
              </Text>
              <Button
                title="Explore Styles"
                onPress={() => navigation.navigate('DiscoverTab')}
                variant="gradient"
                size="medium"
                icon="arrow-forward"
                iconPosition="right"
              />
            </View>
          </Card>
        </View>

        {/* Tips & Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for You</Text>
          <Card style={styles.tipCard}>
            <View style={styles.tipContent}>
              <View style={[styles.tipIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                <Ionicons name="bulb" size={24} color={colors.accent.blue} />
              </View>
              <View style={styles.tipText}>
                <Text style={styles.tipTitle}>Book in Advance</Text>
                <Text style={styles.tipDescription}>
                  Popular barbers fill up fast. Book 1-2 weeks ahead for best availability.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  greeting: { ...textStyles.body, color: colors.text.secondary },
  userName: { ...textStyles.h2, fontWeight: '700', marginTop: spacing.xs },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: { width: '48%' },
  quickActionGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { ...textStyles.body, fontWeight: '700', textAlign: 'center' },
  upcomingCard: { marginHorizontal: spacing.lg, marginBottom: spacing.xl, padding: 0 },
  upcomingGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  upcomingContent: { flexDirection: 'row', gap: spacing.md },
  upcomingIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingText: { flex: 1 },
  upcomingTitle: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.6)' },
  upcomingDetails: { ...textStyles.h3, fontWeight: '700', color: '#000', marginTop: 2 },
  upcomingBarber: { ...textStyles.bodySmall, color: 'rgba(0,0,0,0.7)', marginTop: 2 },
  upcomingButton: { alignSelf: 'flex-start' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...textStyles.h3, fontWeight: '700' },
  seeAllText: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  barbersList: { gap: spacing.md },
  barberCard: {
    width: 160,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  barberInfo: { width: '100%', alignItems: 'center' },
  barberName: { ...textStyles.body, fontWeight: '700', textAlign: 'center' },
  barberBusiness: { ...textStyles.caption, color: colors.text.secondary, textAlign: 'center' },
  barberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  barberRating: { ...textStyles.caption, fontWeight: '600' },
  barberDot: { ...textStyles.caption, color: colors.text.secondary },
  barberDistance: { ...textStyles.caption, color: colors.text.secondary },
  featuredCard: { padding: spacing.xl },
  featuredContent: { alignItems: 'center', gap: spacing.md },
  featuredTitle: { ...textStyles.h3, fontWeight: '700', textAlign: 'center' },
  featuredSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tipCard: { padding: spacing.lg },
  tipContent: { flexDirection: 'row', gap: spacing.md },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1 },
  tipTitle: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.xs },
  tipDescription: { ...textStyles.bodySmall, color: colors.text.secondary, lineHeight: 18 },
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
