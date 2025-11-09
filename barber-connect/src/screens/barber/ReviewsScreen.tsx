import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface Review {
  id: string;
  client: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  service: string;
  timestamp: Date;
  helpful: number;
  images?: string[];
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    client: { name: 'John Doe' },
    rating: 5,
    comment: 'Amazing fade! Mike really knows what he\'s doing. Clean lines, great attention to detail. Will definitely be back!',
    service: 'Premium Fade',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    helpful: 12,
  },
  {
    id: '2',
    client: { name: 'David Martinez' },
    rating: 5,
    comment: 'Best barber in town! Always consistent quality and great conversation.',
    service: 'Haircut & Beard Trim',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    helpful: 8,
  },
  {
    id: '3',
    client: { name: 'James Wilson' },
    rating: 4,
    comment: 'Good cut overall. A bit of wait time but worth it. Professional service.',
    service: 'Classic Cut',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    helpful: 5,
  },
  {
    id: '4',
    client: { name: 'Robert Brown' },
    rating: 5,
    comment: 'Incredible experience! The atmosphere is great and the cut is perfect every time.',
    service: 'Premium Fade',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    helpful: 15,
  },
];

export const ReviewsScreen = ({ route, navigation }: any) => {
  const { barberId, barberName } = route.params;
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  // Write Review State
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const calculateStats = () => {
    const total = reviews.length;
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };
    return { total, average, distribution };
  };

  const stats = calculateStats();

  const formatTimestamp = (date: Date): string => {
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
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        return b.helpful - a.helpful;
      }
    });

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters');
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newReview: Review = {
      id: Date.now().toString(),
      client: { name: 'You' },
      rating,
      comment: reviewText,
      service: 'Recent Service',
      timestamp: new Date(),
      helpful: 0,
    };

    setReviews([newReview, ...reviews]);
    setShowWriteModal(false);
    setRating(0);
    setReviewText('');

    Alert.alert('Success', 'Your review has been posted!');
  };

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
        <Avatar name={item.client.name} size="md" />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.clientName}>{item.client.name}</Text>
          <View style={styles.reviewMeta}>
            {renderStars(item.rating)}
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.serviceTag}>{item.service}</Text>
      <Text style={styles.reviewComment}>{item.comment}</Text>

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons name="thumbs-up-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.helpfulText}>Helpful ({item.helpful})</Text>
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
                  <Text style={styles.averageNumber}>{stats.average.toFixed(1)}</Text>
                  {renderStars(Math.round(stats.average), 20)}
                  <Text style={styles.totalReviews}>{stats.total} reviews</Text>
                </View>

                <View style={styles.distributionContainer}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <View key={star} style={styles.distributionRow}>
                      <Text style={styles.distributionLabel}>{star}</Text>
                      <Ionicons name="star" size={12} color={colors.accent.gold} />
                      <View style={styles.distributionBar}>
                        <View
                          style={[
                            styles.distributionFill,
                            {
                              width: `${
                                stats.total > 0
                                  ? (stats.distribution[star as keyof typeof stats.distribution] /
                                      stats.total) *
                                    100
                                  : 0
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.distributionCount}>
                        {stats.distribution[star as keyof typeof stats.distribution]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <Button
                title="Write a Review"
                onPress={() => setShowWriteModal(true)}
                variant="gradient"
                size="medium"
                fullWidth
                icon="create-outline"
              />
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

      {/* Write Review Modal */}
      <Modal
        visible={showWriteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWriteModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWriteModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write Review</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>How was your experience?</Text>
            <View style={styles.ratingSelector}>
              {renderStars(rating, 40, true)}
            </View>

            <Text style={styles.modalLabel}>Tell us more</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share details of your experience..."
              placeholderTextColor={colors.text.secondary}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{reviewText.length}/500</Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Post Review"
              onPress={handleSubmitReview}
              variant="gradient"
              size="large"
              fullWidth
              icon="checkmark"
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  serviceTag: {
    ...textStyles.caption,
    color: colors.accent.gold,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  reviewComment: { ...textStyles.body, color: colors.text.primary, lineHeight: 22, marginBottom: spacing.md },
  reviewFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
  helpfulButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  helpfulText: { ...textStyles.caption, color: colors.text.secondary },
  modalContainer: { flex: 1, backgroundColor: colors.background.primary },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCancel: { ...textStyles.body, color: colors.text.secondary },
  modalTitle: { ...textStyles.h3, fontWeight: '700' },
  modalContent: { flex: 1, padding: spacing.lg },
  modalLabel: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.md },
  ratingSelector: { alignItems: 'center', marginBottom: spacing.xl },
  reviewInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    minHeight: 150,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  charCount: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
