import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { BarberProfile } from '../../types/barber.types';
import { MOCK_BARBERS } from '../../utils/mockData';

const { width } = Dimensions.get('window');
const PORTFOLIO_ITEM_SIZE = (width - spacing.lg * 3) / 3;

export const BarberProfileScreen = ({ route, navigation }: any) => {
  const { barberId } = route.params;
  const barber = MOCK_BARBERS.find((b) => b.id === barberId) || MOCK_BARBERS[0];

  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'reviews'>('portfolio');
  const [isFollowing, setIsFollowing] = useState(false);

  const portfolioImages = Array(12).fill('https://via.placeholder.com/150');

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
              onPress={() => setIsFollowing(!isFollowing)}
              variant={isFollowing ? 'secondary' : 'outline'}
              size="large"
              icon={isFollowing ? 'checkmark' : 'person-add'}
              style={styles.followButton}
            />
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble" size={24} color={colors.text.primary} />
            </TouchableOpacity>
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
            {portfolioImages.map((image, index) => (
              <TouchableOpacity key={index} style={styles.portfolioItem}>
                <Image source={{ uri: image }} style={styles.portfolioImage} />
                {index % 4 === 0 && (
                  <View style={styles.videoIndicator}>
                    <Ionicons name="play" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
              <Text style={styles.ratingValue}>{barber.rating}</Text>
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
            </View>

            {/* Mock Reviews */}
            {[1, 2, 3].map((review) => (
              <Card key={review} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Avatar name={`Client ${review}`} size="sm" />
                  <View style={styles.reviewAuthor}>
                    <Text style={styles.reviewName}>Client {review}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={12}
                          color={colors.accent.gold}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>2 days ago</Text>
                </View>
                <Text style={styles.reviewText}>
                  Amazing cut! Best barber in the city. The fade was perfect and the service was
                  top-notch. Highly recommend!
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
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
});
