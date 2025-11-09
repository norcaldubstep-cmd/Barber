import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { LikeButton } from '../../components/social/LikeButton';
import { CommentButton } from '../../components/social/CommentButton';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.lg * 3) / 2;

interface PortfolioItem {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  likes: number;
  comments: number;
  liked?: boolean;
  category: string;
}

// Mock portfolio data
const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    title: 'Classic Fade',
    description: 'Clean mid fade with textured top',
    likes: 342,
    comments: 28,
    liked: false,
    category: 'Fade',
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/400/600?random=2',
    title: 'Beard Sculpting',
    description: 'Precision beard trim and shaping',
    likes: 287,
    comments: 15,
    liked: true,
    category: 'Beard',
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/400/600?random=3',
    title: 'Taper Cut',
    description: 'Low taper with clean lineup',
    likes: 423,
    comments: 32,
    liked: false,
    category: 'Taper',
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/400/600?random=4',
    title: 'Design Work',
    description: 'Custom hair design',
    likes: 512,
    comments: 45,
    liked: false,
    category: 'Design',
  },
  {
    id: '5',
    imageUrl: 'https://picsum.photos/400/600?random=5',
    title: 'Lineup',
    description: 'Sharp edge up and shape up',
    likes: 198,
    comments: 12,
    liked: false,
    category: 'Lineup',
  },
  {
    id: '6',
    imageUrl: 'https://picsum.photos/400/600?random=6',
    title: 'Long Hair Cut',
    description: 'Textured crop with layers',
    likes: 265,
    comments: 18,
    liked: false,
    category: 'Haircut',
  },
];

const CATEGORIES = ['All', 'Fade', 'Beard', 'Taper', 'Design', 'Lineup', 'Haircut'];

export const PortfolioScreen = ({ navigation, route }: any) => {
  const { barberName = 'Mike Johnson' } = route.params || {};

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredPortfolio =
    selectedCategory === 'All'
      ? MOCK_PORTFOLIO
      : MOCK_PORTFOLIO.filter((item) => item.category === selectedCategory);

  const handleItemPress = (item: PortfolioItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderCategoryChip = (category: string) => {
    const isSelected = selectedCategory === category;

    return (
      <TouchableOpacity
        key={category}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.7}
      >
        {isSelected ? (
          <LinearGradient
            colors={['#D4AF37', '#FFD700']}
            style={styles.categoryChip}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.categoryText, { color: '#000' }]}>{category}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.categoryChip, styles.categoryChipInactive]}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPortfolioItem = ({ item }: { item: PortfolioItem }) => (
    <TouchableOpacity
      style={styles.portfolioItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.portfolioOverlay}
      >
        {item.title && <Text style={styles.portfolioTitle}>{item.title}</Text>}
        <View style={styles.portfolioStats}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={14} color={colors.error} />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={14} color={colors.accent.blue} />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Portfolio</Text>
          <Text style={styles.headerSubtitle}>{barberName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        />
      </View>

      {/* Portfolio Grid */}
      <FlatList
        data={filteredPortfolio}
        renderItem={renderPortfolioItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.portfolioGrid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          {selectedItem && (
            <View style={styles.modalContent}>
              {/* Image */}
              <Image source={{ uri: selectedItem.imageUrl }} style={styles.modalImage} />

              {/* Info */}
              <View style={styles.modalInfo}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>{selectedItem.title || 'Untitled'}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{selectedItem.category}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close-circle" size={32} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {selectedItem.description && (
                  <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                )}

                {/* Actions */}
                <View style={styles.modalActions}>
                  <LikeButton
                    initialLiked={selectedItem.liked}
                    initialCount={selectedItem.likes}
                    size="large"
                  />
                  <CommentButton count={selectedItem.comments} size="large" />
                  <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
                    <Ionicons name="share-outline" size={26} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  categories: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  categoryChipInactive: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  categoryText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  portfolioGrid: {
    padding: spacing.lg,
  },
  columnWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  portfolioItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  portfolioTitle: {
    ...textStyles.body,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  portfolioStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...textStyles.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
  },
  modalImage: {
    width: '100%',
    height: width * 0.9 * 1.3,
    backgroundColor: colors.background.secondary,
  },
  modalInfo: {
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitleContainer: {
    flex: 1,
    gap: spacing.sm,
  },
  modalTitle: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    ...textStyles.caption,
    color: colors.accent.gold,
    fontWeight: '700',
  },
  closeButton: {
    marginLeft: spacing.md,
  },
  modalDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  shareButton: {
    marginLeft: 'auto',
  },
});
