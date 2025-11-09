import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { PostType } from '../../types/post.types';

const POST_TYPES: Array<{ type: PostType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { type: 'SHOWCASE', label: 'Showcase Work', icon: 'images-outline' },
  { type: 'TUTORIAL', label: 'Tutorial', icon: 'school-outline' },
  { type: 'PROMOTION', label: 'Promotion', icon: 'megaphone-outline' },
  { type: 'ANNOUNCEMENT', label: 'Announcement', icon: 'notifications-outline' },
  { type: 'TIP', label: 'Tip & Advice', icon: 'bulb-outline' },
];

const HAIR_TAGS = [
  'Fade',
  'Taper',
  'Buzz Cut',
  'Crew Cut',
  'Undercut',
  'Pompadour',
  'Quiff',
  'Textured Crop',
  'Side Part',
  'Slick Back',
  'Man Bun',
  'Long Hair',
  'Beard Trim',
  'Line Up',
  'Skin Fade',
  'High Fade',
  'Mid Fade',
  'Low Fade',
  'Drop Fade',
  'Burst Fade',
];

export const CreatePostScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [postType, setPostType] = useState<PostType>('SHOWCASE');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages].slice(0, 10)); // Max 10 images
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 10) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        Alert.alert('Tag Limit', 'You can select up to 10 tags');
      }
    }
  };

  const handlePost = async () => {
    if (images.length === 0) {
      Alert.alert('No Media', 'Please add at least one image to your post');
      return;
    }

    if (caption.trim().length === 0) {
      Alert.alert('No Caption', 'Please add a caption to your post');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate post creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert('Success', 'Your post has been published!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Feed');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <Avatar
            name={`${user?.firstName} ${user?.lastName}`}
            size="md"
            verified
            showGradientBorder
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userRole}>Professional Barber</Text>
          </View>
        </View>

        {/* Post Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postTypesContainer}
          >
            {POST_TYPES.map((type) => (
              <TouchableOpacity
                key={type.type}
                onPress={() => setPostType(type.type)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    postType === type.type
                      ? ['#D4AF37', '#FFD700']
                      : [colors.background.secondary, colors.background.secondary]
                  }
                  style={styles.postTypeCard}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={postType === type.type ? '#000' : colors.text.primary}
                  />
                  <Text
                    style={[
                      styles.postTypeText,
                      postType === type.type && styles.postTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Media ({images.length}/10)</Text>
            <Text style={styles.requiredText}>Required</Text>
          </View>

          <View style={styles.mediaGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>Primary</Text>
                  </View>
                )}
              </View>
            ))}

            {images.length < 10 && (
              <>
                <TouchableOpacity style={styles.addMediaButton} onPress={pickImages}>
                  <Ionicons name="images-outline" size={32} color={colors.accent.gold} />
                  <Text style={styles.addMediaText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addMediaButton} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={32} color={colors.accent.gold} />
                  <Text style={styles.addMediaText}>Camera</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Caption</Text>
            <Text style={styles.requiredText}>Required</Text>
          </View>
          <TextInput
            style={styles.captionInput}
            placeholder="Share details about your work, technique, or tips..."
            placeholderTextColor={colors.text.secondary}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{caption.length}/2000</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tags ({selectedTags.length}/10)</Text>
            <Text style={styles.optionalText}>Optional</Text>
          </View>
          <View style={styles.tagsContainer}>
            {HAIR_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    selectedTags.includes(tag)
                      ? ['#D4AF37', '#FFD700']
                      : [colors.background.secondary, colors.background.secondary]
                  }
                  style={styles.tag}
                >
                  <Text
                    style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}
                  >
                    #{tag}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="location-outline" size={20} color={colors.text.primary} />
                <Text style={styles.settingText}>Add Location</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="people-outline" size={20} color={colors.text.primary} />
                <Text style={styles.settingText}>Tag People</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="pricetag-outline" size={20} color={colors.text.primary} />
                <Text style={styles.settingText}>Add Product Tags</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Save as Draft"
          onPress={() => Alert.alert('Draft Saved', 'Your post has been saved as a draft')}
          variant="outline"
          size="large"
          style={styles.draftButton}
        />
        <Button
          title="Publish"
          onPress={handlePost}
          variant="gradient"
          size="large"
          style={styles.publishButton}
          isLoading={isLoading}
          icon="checkmark"
        />
      </View>
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  userInfo: { flex: 1 },
  userName: { ...textStyles.body, fontWeight: '700', marginBottom: 2 },
  userRole: { ...textStyles.caption, color: colors.text.secondary },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...textStyles.h3, fontWeight: '700' },
  requiredText: { ...textStyles.caption, color: colors.error },
  optionalText: { ...textStyles.caption, color: colors.text.secondary },
  postTypesContainer: { gap: spacing.sm },
  postTypeCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 120,
  },
  postTypeText: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  postTypeTextActive: { color: '#000', fontWeight: '700' },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mediaItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: { width: '100%', height: '100%' },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.accent.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  primaryText: { fontSize: 10, fontWeight: '700', color: '#000' },
  addMediaButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addMediaText: { ...textStyles.caption, color: colors.accent.gold, fontWeight: '600' },
  captionInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.text.primary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  charCount: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  tagTextActive: { color: '#000', fontWeight: '700' },
  settingsContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingText: { ...textStyles.body, fontWeight: '600' },
  settingDivider: { height: 1, backgroundColor: colors.border.light, marginHorizontal: spacing.sm },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.card,
    gap: spacing.sm,
  },
  draftButton: { flex: 1 },
  publishButton: { flex: 2 },
});
