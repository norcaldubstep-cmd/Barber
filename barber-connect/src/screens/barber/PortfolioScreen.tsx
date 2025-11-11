import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import {
  getBarberPortfolio,
  addPortfolioImage,
  deletePortfolioImage,
} from '../../services/barberService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.lg * 3) / 2;

export const PortfolioScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setLoading(true);
      const images = await getBarberPortfolio(user.id);
      setPortfolio(images);
    } catch (err) {
      console.error('Load portfolio error:', err);
      Alert.alert('Error', 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    // Mock image upload - in real app would use image picker
    const mockImageUrl = `https://picsum.photos/400/600?random=${Date.now()}`;

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      await addPortfolioImage(user.id, mockImageUrl);
      Alert.alert('Success', 'Image added to portfolio');
      await loadPortfolio();
    } catch (err) {
      console.error('Add image error:', err);
      Alert.alert('Error', 'Failed to add image');
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    Alert.alert(
      'Delete Image',
      'Are you sure you want to remove this image from your portfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePortfolioImage(user.id, imageUrl);
              Alert.alert('Deleted', 'Image removed from portfolio');
              await loadPortfolio();
              setModalVisible(false);
            } catch (err) {
              console.error('Delete image error:', err);
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const renderPortfolioItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.portfolioItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item }} style={styles.portfolioImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Portfolio</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
          <Ionicons name="add-circle" size={28} color={colors.accent.gold} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
        </View>
      ) : portfolio.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>No Portfolio Images</Text>
          <Text style={styles.emptySubtitle}>
            Add images to showcase your work to potential clients
          </Text>
        </View>
      ) : (
        <FlatList
          data={portfolio}
          renderItem={renderPortfolioItem}
          keyExtractor={(item, index) => `${item}_${index}`}
          numColumns={2}
          contentContainerStyle={styles.portfolioGrid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

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

          {selectedImage && (
            <View style={styles.modalContent}>
              {/* Image */}
              <Image source={{ uri: selectedImage }} style={styles.modalImage} />

              {/* Actions */}
              <View style={styles.modalInfo}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Portfolio Image</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close-circle" size={32} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteImage(selectedImage)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                    <Text style={styles.deleteButtonText}>Delete Image</Text>
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
  headerTitle: {
    ...textStyles.h2,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  emptyTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
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
  modalTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {},
  modalActions: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.lg,
  },
  deleteButtonText: {
    ...textStyles.body,
    color: colors.error,
    fontWeight: '600',
  },
});
