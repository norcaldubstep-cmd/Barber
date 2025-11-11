import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
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
import { useAuthStore } from '../../store/authStore';
import { getBarberProfile, getBarberPortfolio } from '../../services/barberService';
import { getBarberReviews } from '../../services/reviewsService';
import { getUserFavorites, addFavorite, removeFavorite } from '../../services/usersService';
import { toggleFollow } from '../../services/usersService';
import { Review } from '../../types/review.types';

const { width } = Dimensions.get('window');
const PORTFOLIO_ITEM_SIZE = (width - spacing.lg * 3) / 3;

export const BarberProfileScreen = ({ route, navigation }: any) => {
  const { barberId } = route.params;
  const { user } = useAuthStore();
  const isCurrentUser = user?.id === barberId;

  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'reviews'>('portfolio');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBarberProfile();
  }, [barberId]);

  const loadBarberProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load barber profile
      const profile = await getBarberProfile(barberId);
      if (!profile) {
        setError('Barber not found');
        setIsLoading(false);
        return;
      }
      setBarber(profile);

      // Load portfolio images
      const portfolio = await getBarberPortfolio(barberId);
      setPortfolioImages(portfolio);

      // Load reviews
      const barberReviews = await getBarberReviews(barberId, 5);
      setReviews(barberReviews);

      // Check if current user is following this barber
      if (user) {
        // Check favorites
        const favorites = await getUserFavorites(user.id);
        setIsFavorite(favorites.includes(barberId));

        // Note: Following status is not directly available from current services
        // We'll need to track this differently or add to barber profile
        // For now, we'll assume not following
        setIsFollowing(false);
      }
    } catch (err) {
      console.error('Error loading barber profile:', err);
      setError('Failed to load barber profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      Alert.alert('Not logged in', 'Please log in to follow barbers');
      return;
    }

    try {
      await toggleFollow(barberId, isFollowing);
      setIsFollowing(!isFollowing);

      // Update followers count locally
      if (barber) {
        setBarber({
          ...barber,
          followersCount: barber.followersCount + (isFollowing ? -1 : 1),
        });
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      Alert.alert('Not logged in', 'Please log in to favorite barbers');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(user.id, barberId);
      } else {
        await addFavorite(user.id, barberId);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !barber) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Barber not found'}</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Cover Image */}
        <LinearGradient
          colors={[barber.themeColor || colors.accent.gold, colors.primary.main]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coverGradient}
        />

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar
              name={barber.displayName}
              size="2xl"
              verified={barber.isVerified}
              showGradientBorder={barber.promotionTier !== 'FREE'}
            />
            {barber.promotionTier !== 'FREE' && (
              <View style={[styles.tierBadge, { backgroundColor: colors.accent.gold }]}>
                <Ionicons name="star" size={16} color="#000" />
                <Text style={styles.tierText}>{barber.promotionTier}</Text>
              </View>
            )}
          </View>

          <Text style={styles.displayName}>{barber.displayName}</Text>
          {barber.worksAt && (
            <View style={styles.worksAtRow}>
              <Ionicons name="business" size={16} color={colors.text.secondary} />
              <Text style={styles.worksAtText}>{barber.worksAt}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{barber.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>
                {barber.followersCount >= 1000
                  ? `${(barber.followersCount / 1000).toFixed(1)}K`
                  : barber.followersCount}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{barber.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Bio */}
          {barber.bio && <Text style={styles.bio}>{barber.bio}</Text>}

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={18} color={colors.accent.gold} />
              <Text style={styles.detailText}>
                {barber.rating} ({barber.totalReviews} reviews)
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={18} color={colors.text.secondary} />
              <Text style={styles.detailText}>
                {barber.location.city}, {barber.location.state}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color={colors.text.secondary} />
              <Text style={styles.detailText}>Response: {barber.responseTime}</Text>
            </View>
            {barber.yearsOfExperience > 0 && (
              <View style={styles.detailItem}>
                <Ionicons name="ribbon" size={18} color={colors.text.secondary} />
                <Text style={styles.detailText}>{barber.yearsOfExperience} years experience</Text>
              </View>
            )}
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesContainer}>
            {barber.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isCurrentUser ? (
              <Button
                title="Edit Profile"
                onPress={() => navigation.navigate('EditProfile')}
                variant="gradient"
                size="large"
                icon="create"
                fullWidth
              />
            ) : (
              <>
                <Button
                  title="Book Now"
                  onPress={() => navigation.navigate('Booking', { barberId: barber.id })}
                  variant="gradient"
                  size="large"
                  icon="calendar"
                  style={styles.bookButton}
                />
                <Button
                  title={isFollowing ? 'Following' : 'Follow'}
                  onPress={handleFollowToggle}
                  variant={isFollowing ? 'secondary' : 'outline'}
                  size="large"
                  icon={isFollowing ? 'checkmark' : 'person-add'}
                  style={styles.followButton}
                />
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => navigation.navigate('Messages', { barberId: barber.id })}
                >
                  <Ionicons name="chatbubble" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoriteToggle}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? colors.error : colors.text.primary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['portfolio', 'services', 'reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <View style={styles.portfolioGrid}>
            {portfolioImages.length > 0 ? (
              portfolioImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.portfolioItem}
                  onPress={() => navigation.navigate('Portfolio', { barberName: barber.displayName })}
                >
                  <Image source={{ uri: image }} style={styles.portfolioImage} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="images-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>No portfolio images yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.servicesContainer}>
            {barber.services.map((service) => (
              <Card key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                    )}
                    <View style={styles.serviceMeta}>
                      <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                      <Text style={styles.serviceMetaText}>{service.duration} min</Text>
                    </View>
                  </View>
                  <View style={styles.servicePricing}>
                    <Text style={styles.servicePrice}>${service.price}</Text>
                    {service.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingValue}>{barber.rating.toFixed(1)}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={20}
                    color={star <= Math.floor(barber.rating) ? colors.accent.gold : colors.border.light}
                  />
                ))}
              </View>
              <Text style={styles.ratingCount}>{barber.totalReviews} reviews</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Reviews', { barberId: barber.id })}
              >
                <Text style={styles.viewAllText}>View All Reviews</Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Avatar name={review.clientName} size="sm" />
                    <View style={styles.reviewAuthor}>
                      <Text style={styles.reviewName}>{review.clientName}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name="star"
                            size={12}
                            color={star <= review.rating ? colors.accent.gold : colors.border.light}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                  {review.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text style={styles.verifiedText}>Verified Booking</Text>
                    </View>
                  )}
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbox-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>No reviews yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: {
    ...textStyles.h3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGradient: { width: '100%', height: 180 },
  profileSection: { padding: spacing.lg, marginTop: -60 },
  avatarContainer: { position: 'relative', alignSelf: 'center', marginBottom: spacing.md },
  tierBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  tierText: { fontSize: 10, fontWeight: '900', color: '#000' },
  displayName: { ...textStyles.h2, textAlign: 'center', marginBottom: spacing.xs },
  worksAtRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.md },
  worksAtText: { ...textStyles.body, color: colors.text.secondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  statItem: { alignItems: 'center' },
  statValue: { ...textStyles.h3, fontWeight: '700' },
  statLabel: { ...textStyles.caption, color: colors.text.secondary, marginTop: spacing.xs },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border.light },
  bio: { ...textStyles.body, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  detailsContainer: { gap: spacing.sm, marginBottom: spacing.lg },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailText: { ...textStyles.body, color: colors.text.primary },
  specialtiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  specialtyTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.gold + '20',
  },
  specialtyText: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: spacing.sm },
  bookButton: { flex: 1 },
  followButton: { flex: 1 },
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.accent.gold },
  tabText: { ...textStyles.body, color: colors.text.secondary, fontWeight: '600' },
  tabTextActive: { color: colors.accent.gold },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 2 },
  portfolioItem: { width: PORTFOLIO_ITEM_SIZE, height: PORTFOLIO_ITEM_SIZE, position: 'relative' },
  portfolioImage: { width: '100%', height: '100%' },
  videoIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.sm,
    padding: 4,
  },
  servicesContainer: { padding: spacing.lg, gap: spacing.md },
  serviceCard: { padding: spacing.md },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceInfo: { flex: 1 },
  serviceName: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.xs },
  serviceDescription: { ...textStyles.bodySmall, color: colors.text.secondary, marginBottom: spacing.sm },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceMetaText: { ...textStyles.caption, color: colors.text.secondary },
  servicePricing: { alignItems: 'flex-end' },
  servicePrice: { ...textStyles.h3, color: colors.accent.gold, fontWeight: '700', marginBottom: spacing.xs },
  popularBadge: { backgroundColor: colors.accent.gold + '20', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  popularText: { fontSize: 10, fontWeight: '700', color: colors.accent.gold },
  reviewsContainer: { padding: spacing.lg, gap: spacing.md },
  ratingOverview: { alignItems: 'center', marginBottom: spacing.lg },
  ratingValue: { ...textStyles.h1, fontWeight: '700', marginBottom: spacing.xs },
  ratingStars: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  ratingCount: { ...textStyles.body, color: colors.text.secondary },
  reviewCard: { padding: spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reviewAuthor: { flex: 1, marginLeft: spacing.sm },
  reviewName: { ...textStyles.bodySmall, fontWeight: '700' },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewDate: { ...textStyles.caption, color: colors.text.secondary },
  reviewText: { ...textStyles.bodySmall, lineHeight: 18 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  verifiedText: {
    ...textStyles.caption,
    color: colors.success,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyStateText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
});
