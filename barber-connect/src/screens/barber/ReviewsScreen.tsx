import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { getBarberReviews, getBarberRating } from '../../services/reviewsService';

interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  images?: string[];
}

interface BarberRating {
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export const ReviewsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingData, setRatingData] = useState<BarberRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setLoading(true);
      const [fetchedReviews, rating] = await Promise.all([
        getBarberReviews(user.id, 50),
        getBarberRating(user.id),
      ]);

      setReviews(fetchedReviews);
      if (rating) {
        setRatingData({
          averageRating: rating.averageRating,
          totalReviews: rating.totalReviews,
          fiveStars: rating.fiveStars,
          fourStars: rating.fourStars,
          threeStars: rating.threeStars,
          twoStars: rating.twoStars,
          oneStar: rating.oneStar,
        });
      }
    } catch (err) {
      console.error('Load reviews error:', err);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const stats = ratingData || {
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const diffInDays = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const filteredReviews = reviews
    .filter((r) => filter === 'all' || r.rating === filter)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.helpfulCount - a.helpfulCount;
      }
    });

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && setRating(star)}
            disabled={!interactive}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? colors.accent.gold : colors.text.secondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Avatar name={item.clientName} size="md" imageUrl={item.clientAvatar} />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <View style={styles.reviewMeta}>
            {renderStars(item.rating)}
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons name="thumbs-up-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.helpfulText}>Helpful ({item.helpfulCount})</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Stats Card */}
              <Card style={styles.statsCard}>
                <View style={styles.statsHeader}>
                  <View style={styles.averageContainer}>
                    <Text style={styles.averageNumber}>{stats.averageRating.toFixed(1)}</Text>
                    {renderStars(Math.round(stats.averageRating), 20)}
                    <Text style={styles.totalReviews}>{stats.totalReviews} reviews</Text>
                  </View>

                  <View style={styles.distributionContainer}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const starKey = star === 5 ? 'fiveStars' : star === 4 ? 'fourStars' : star === 3 ? 'threeStars' : star === 2 ? 'twoStars' : 'oneStar';
                      return (
                        <View key={star} style={styles.distributionRow}>
                          <Text style={styles.distributionLabel}>{star}</Text>
                          <Ionicons name="star" size={12} color={colors.accent.gold} />
                          <View style={styles.distributionBar}>
                            <View
                              style={[
                                styles.distributionFill,
                                {
                                  width: `${
                                    stats.totalReviews > 0
                                      ? (stats[starKey] / stats.totalReviews) * 100
                                      : 0
                                  }%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.distributionCount}>{stats[starKey]}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Card>

            {/* Filters */}
            <View style={styles.filtersSection}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Filter:</Text>
                {(['all', 5, 4, 3, 2, 1] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        filter === f
                          ? ['#D4AF37', '#FFD700']
                          : [colors.background.secondary, colors.background.secondary]
                      }
                      style={styles.filterChip}
                    >
                      <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                        {f === 'all' ? 'All' : `${f}★`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setSortBy(sortBy === 'recent' ? 'helpful' : 'recent')}
              >
                <Ionicons name="swap-vertical" size={16} color={colors.text.secondary} />
                <Text style={styles.sortText}>
                  {sortBy === 'recent' ? 'Most Recent' : 'Most Helpful'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  listContent: { padding: spacing.lg },
  statsCard: { padding: spacing.lg, marginBottom: spacing.lg },
  statsHeader: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.xl },
  averageContainer: { alignItems: 'center', gap: spacing.xs },
  averageNumber: { fontSize: 48, fontWeight: '900', color: colors.text.primary },
  totalReviews: { ...textStyles.caption, color: colors.text.secondary, marginTop: spacing.xs },
  distributionContainer: { flex: 1, gap: spacing.xs },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  distributionLabel: { ...textStyles.caption, width: 12 },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  distributionFill: { height: '100%', backgroundColor: colors.accent.gold },
  distributionCount: { ...textStyles.caption, color: colors.text.secondary, width: 24 },
  filtersSection: { marginBottom: spacing.lg },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  filterLabel: { ...textStyles.bodySmall, fontWeight: '600' },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  filterText: { ...textStyles.caption, fontWeight: '600', color: colors.text.primary },
  filterTextActive: { color: '#000', fontWeight: '700' },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortText: { ...textStyles.bodySmall, color: colors.text.secondary },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewCard: { padding: spacing.lg, marginBottom: spacing.md },
  reviewHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  reviewHeaderText: { flex: 1 },
  clientName: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.xs },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaDot: { ...textStyles.caption, color: colors.text.secondary },
  timestamp: { ...textStyles.caption, color: colors.text.secondary },
  reviewComment: { ...textStyles.body, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.md },
  reviewFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  helpfulButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  helpfulText: { ...textStyles.caption, color: colors.text.secondary },
});
