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
import {
  pickImage,
  takePhoto,
  uploadImage,
  getPortfolioImagesPath,
} from '../../services/imageUploadService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.lg * 3) / 2;

export const PortfolioScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);

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
      // console.error('Load portfolio error:', err);
      Alert.alert('Error', 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImagePress = () => {
    setImagePickerModalVisible(true);
  };

  const handlePickFromGallery = async () => {
    setImagePickerModalVisible(false);

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const imageUri = await pickImage({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (imageUri) {
      await uploadPortfolioImage(imageUri);
    }
  };

  const handleTakePhoto = async () => {
    setImagePickerModalVisible(false);

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const imageUri = await takePhoto({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (imageUri) {
      await uploadPortfolioImage(imageUri);
    }
  };

  const uploadPortfolioImage = async (imageUri: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setUploading(true);

      // Upload image to Firebase Storage
      const storagePath = getPortfolioImagesPath(user.id);
      const downloadUrl = await uploadImage(imageUri, storagePath);

      // Add to portfolio in Firestore
      await addPortfolioImage(user.id, downloadUrl);

      Alert.alert('Success', 'Image added to portfolio');
      await loadPortfolio();
    } catch (err) {
      // console.error('Add image error:', err);
      Alert.alert('Error', 'Failed to add image. Please try again.');
    } finally {
      setUploading(false);
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
              // console.error('Delete image error:', err);
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddImagePress}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.accent.gold} />
          ) : (
            <Ionicons name="add-circle" size={28} color={colors.accent.gold} />
          )}
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator size="small" color={colors.accent.gold} />
          <Text style={styles.uploadingText}>Uploading image...</Text>
        </View>
      )}

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
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddImagePress}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#D4AF37', '#E8C869']} style={styles.emptyButtonGradient}>
              <Ionicons name="add" size={24} color="#000" />
              <Text style={styles.emptyButtonText}>Add First Image</Text>
            </LinearGradient>
          </TouchableOpacity>
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

      {/* Image Picker Modal */}
      <Modal
        visible={imagePickerModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setImagePickerModalVisible(false)}
      >
        <View style={styles.imagePickerModalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setImagePickerModalVisible(false)}
          />

          <View style={styles.imagePickerContent}>
            <View style={styles.imagePickerHeader}>
              <Text style={styles.imagePickerTitle}>Add Portfolio Image</Text>
              <TouchableOpacity onPress={() => setImagePickerModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.imagePickerOptionIcon}>
                <Ionicons name="camera" size={28} color={colors.accent.gold} />
              </View>
              <View style={styles.imagePickerOptionText}>
                <Text style={styles.imagePickerOptionTitle}>Take Photo</Text>
                <Text style={styles.imagePickerOptionSubtitle}>
                  Capture a new photo with your camera
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.imagePickerDivider} />

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={handlePickFromGallery}
              activeOpacity={0.7}
            >
              <View style={styles.imagePickerOptionIcon}>
                <Ionicons name="images" size={28} color={colors.accent.gold} />
              </View>
              <View style={styles.imagePickerOptionText}>
                <Text style={styles.imagePickerOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.imagePickerOptionSubtitle}>
                  Select an existing photo from your library
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
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
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  uploadingText: {
    ...textStyles.body,
    color: colors.text.primary,
    fontWeight: '600',
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
  emptyButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    ...textStyles.body,
    color: '#000',
    fontWeight: '700',
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
  imagePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imagePickerContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imagePickerTitle: {
    ...textStyles.h3,
    fontWeight: '700',
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  imagePickerOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerOptionText: {
    flex: 1,
  },
  imagePickerOptionTitle: {
    ...textStyles.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  imagePickerOptionSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  imagePickerDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
});
