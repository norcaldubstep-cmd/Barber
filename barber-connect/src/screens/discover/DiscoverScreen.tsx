import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LocationSearchModal } from '../../components/common/LocationSearchModal';
import { GuestPrompt } from '../../components/common/GuestPrompt';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { BarberProfile, BarberSearchFilters, SPECIALTIES } from '../../types/barber.types';
import { DISTANCE_OPTIONS } from '../../types/location.types';
import { PROMOTION_PLANS, PromotionTier } from '../../types/promotion.types';
import { calculateDistance, formatDistance } from '../../utils/location.utils';
import { searchBarbers, getNearbyBarbers, getTopRatedBarbers } from '../../services/barberService';
import { useAuthStore } from '../../store/authStore';
import { getLocationOrDefault, getLocationStatusMessage, checkLocationPermission, LocationCoords, reverseGeocodeLocation } from '../../services/locationService';
import { useGuestCheck, getFeatureDisplayName } from '../../hooks/useGuestCheck';

export const DiscoverScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const {
    isGuest,
    showGuestPrompt,
    promptVisible,
    promptFeature,
    handleSignUp,
    handleSignIn,
    handleClose,
  } = useGuestCheck(navigation);

  const [searchQuery, setSearchQuery] = useState('');
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<BarberProfile[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Filters
  const [filters, setFilters] = useState<BarberSearchFilters>({
    maxDistance: 25,
    sortBy: 'promoted',
  });

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadBarbers();
    }
  }, [userLocation, filters]);

  useEffect(() => {
    // Debounce search query
    const timer = setTimeout(() => {
      if (userLocation) {
        loadBarbers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [barbers]);

  const loadLocation = async (forceRefresh = false) => {
    try {
      // Get location (cached, current, or default)
      const location = await getLocationOrDefault(forceRefresh);
      setUserLocation(location);

      // Get location name
      const name = await reverseGeocodeLocation(location.latitude, location.longitude);
      setLocationName(name || 'Current Location');

      // Get status message for UI
      const status = await getLocationStatusMessage();
      setLocationStatus(status);
    } catch (err) {
      // console.error('Error loading location:', err);
      // Even if there's an error, getLocationOrDefault should return default location
      const location = await getLocationOrDefault();
      setUserLocation(location);
      setLocationName('Current Location');
    }
  };

  const handleSelectLocation = async (location: LocationCoords, name: string) => {
    setUserLocation(location);
    setLocationName(name);
    // Immediately reload barbers with new location
    await loadBarbers();
  };

  const loadBarbers = async () => {
    if (!userLocation) return;

    setIsLoading(true);
    setError(null);
    try {
      // Build filter object with location
      const searchFilters: BarberSearchFilters = {
        ...filters,
        query: searchQuery || undefined,
        location: userLocation,
      };

      // Fetch barbers using Firebase
      const fetchedBarbers = await searchBarbers(searchFilters, 50);
      setBarbers(fetchedBarbers);
    } catch (err) {
      // console.error('Error loading barbers:', err);
      setError('Failed to load barbers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Force refresh location to get fresh GPS reading
    await loadLocation(true);
    await loadBarbers();
    setRefreshing(false);
  };

  const handleBooking = async (barber: BarberProfile) => {
    if (isGuest) {
      showGuestPrompt(getFeatureDisplayName('booking'));
      return;
    }

    // Check if barber has external booking URL
    if (barber.socialLinks?.bookingUrl) {
      try {
        const canOpen = await Linking.canOpenURL(barber.socialLinks.bookingUrl);
        if (canOpen) {
          await Linking.openURL(barber.socialLinks.bookingUrl);
        } else {
          Alert.alert('Error', 'Unable to open booking link');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open booking link');
      }
    } else {
      // Use platform booking
      navigation.navigate('Booking', { barberId: barber.id });
    }
  };

  const applyFilters = () => {
    // Since Firebase already handles most filtering, we just need to set the filtered barbers
    // The distance and sorting are already handled by the searchBarbers function
    let filtered = [...barbers];

    // Additional local sorting for promotion tier if needed
    if (filters.sortBy === 'promoted') {
      filtered.sort((a, b) => {
        const aTierPriority = PROMOTION_PLANS.find((p) => p.tier === a.promotionTier)?.priority || 0;
        const bTierPriority = PROMOTION_PLANS.find((p) => p.tier === b.promotionTier)?.priority || 0;
        if (aTierPriority !== bTierPriority) {
          return bTierPriority - aTierPriority;
        }
        return b.rating - a.rating;
      });
    }

    setFilteredBarbers(filtered);
  };

  const renderBarberCard = ({ item }: { item: BarberProfile }) => {
    const promotionPlan = PROMOTION_PLANS.find((p) => p.tier === item.promotionTier);
    const isPromoted = item.promotionTier !== PromotionTier.FREE;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('BarberProfile', { barberId: item.id })}
        activeOpacity={0.9}
      >
        <Card
          variant={isPromoted ? 'elevated' : 'default'}
          style={[
            styles.barberCard,
            isPromoted && {
              borderWidth: 2,
              borderColor: promotionPlan?.color + '40',
            },
          ]}
        >
          {isPromoted && (
            <View style={[styles.promotedBadge, { backgroundColor: promotionPlan?.color }]}>
              <Ionicons name="star" size={12} color="#FFF" />
              <Text style={styles.promotedText}>{promotionPlan?.name.toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.barberHeader}>
            <Avatar
              imageUrl={item.profileImage}
              name={item.displayName}
              size="lg"
              verified={item.isVerified}
              online={item.isAvailable}
              showGradientBorder={isPromoted}
            />
            <View style={styles.barberInfo}>
              <View style={styles.barberNameRow}>
                <Text style={styles.barberName} numberOfLines={1}>
                  {item.displayName}
                </Text>
                {item.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.accent.blue} />
                )}
              </View>
              {item.worksAt && (
                <Text style={styles.worksAt} numberOfLines={1}>
                  @ {item.worksAt}
                </Text>
              )}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color={colors.accent.gold} />
                  <Text style={styles.statText}>{item.rating}</Text>
                  <Text style={styles.statLabel}>({item.totalReviews})</Text>
                </View>
                {item.distance !== undefined && (
                  <>
                    <Text style={styles.statDivider}>•</Text>
                    <View style={styles.statItem}>
                      <Ionicons name="location" size={14} color={colors.text.secondary} />
                      <Text style={styles.statText}>
                        {formatDistance(item.distance, item.distanceUnit)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}

          <View style={styles.specialtiesContainer}>
            {item.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
            {item.specialties.length > 3 && (
              <View style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>+{item.specialties.length - 3}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceRange}>
              <Text style={styles.priceText}>
                ${Math.min(...item.services.map((s) => s.price))} - $
                {Math.max(...item.services.map((s) => s.price))}
              </Text>
            </View>
            <View style={styles.cardActions}>
              {item.instantBooking && (
                <View style={styles.instantBadge}>
                  <Ionicons name="flash" size={12} color={colors.accent.gold} />
                  <Text style={styles.instantText}>Instant</Text>
                </View>
              )}
              <Button
                title="Book"
                onPress={() => handleBooking(item)}
                variant="gradient"
                size="small"
                style={styles.bookButton}
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search barbers, styles, locations..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MapView')}
          >
            <Ionicons name="map-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filters', { onApplyFilters: setFilters })}
          >
            <LinearGradient
              colors={['transparent', 'transparent']}
              style={styles.filterGradient}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={colors.text.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Bar */}
      {userLocation && (
        <View style={styles.locationBarContainer}>
          <TouchableOpacity
            style={styles.locationBar}
            onPress={() => setShowLocationSearch(true)}
          >
            <Ionicons name="location" size={16} color={colors.accent.gold} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName || 'Current Location'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={() => loadLocation(true)}>
            <Ionicons name="refresh" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContent}>
              <Text style={styles.filterLabel}>Distance:</Text>
              {DISTANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filters.maxDistance === option.value && styles.filterChipActive,
                  ]}
                  onPress={() => setFilters({ ...filters, maxDistance: option.value })}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.maxDistance === option.value && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContent}>
              <Text style={styles.filterLabel}>Sort:</Text>
              {[
                { label: 'Promoted', value: 'promoted' },
                { label: 'Nearest', value: 'distance' },
                { label: 'Top Rated', value: 'rating' },
                { label: 'Popular', value: 'popularity' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filters.sortBy === option.value && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      sortBy: option.value as BarberSearchFilters['sortBy'],
                    })
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.sortBy === option.value && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredBarbers.length} barber{filteredBarbers.length !== 1 ? 's' : ''} found
        </Text>
        {filters.sortBy === 'promoted' && (
          <View style={styles.promotedInfo}>
            <Ionicons name="star" size={14} color={colors.accent.gold} />
            <Text style={styles.promotedInfoText}>Showing promoted first</Text>
          </View>
        )}
      </View>

      {/* Barbers List */}
      <FlatList
        data={filteredBarbers}
        renderItem={renderBarberCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>
              {isLoading ? 'Loading...' : error ? 'Error Loading Barbers' : 'No barbers found'}
            </Text>
            <Text style={styles.emptyText}>
              {error || 'Try adjusting your search or filters'}
            </Text>
            {error && (
              <Button
                title="Retry"
                onPress={loadBarbers}
                variant="gradient"
                size="medium"
                style={{ marginTop: spacing.md }}
              />
            )}
          </View>
        }
      />

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={userLocation}
      />

      {/* Guest Prompt Modal */}
      <GuestPrompt
        visible={promptVisible}
        onClose={handleClose}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        feature={promptFeature}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  filterGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  locationBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    flex: 1,
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  refreshButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  filtersPanel: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.sm,
  },
  filtersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterLabel: {
    ...textStyles.bodySmall,
    fontWeight: '700',
    color: colors.text.primary,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.text.inverse,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  promotedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  promotedInfoText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  barberCard: {
    marginBottom: spacing.md,
  },
  promotedBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  promotedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
  },
  barberHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  barberInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  barberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  barberName: {
    ...textStyles.h4,
    fontWeight: '700',
    flex: 1,
  },
  worksAt: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  statDivider: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  bio: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  specialtyTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent.gold + '20',
  },
  specialtyText: {
    ...textStyles.caption,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  priceRange: {},
  priceText: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent.gold + '20',
  },
  instantText: {
    ...textStyles.caption,
    color: colors.accent.gold,
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyTitle: {
    ...textStyles.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
