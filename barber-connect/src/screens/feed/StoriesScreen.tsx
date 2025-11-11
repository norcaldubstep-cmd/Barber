import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import {
  getFeedStories,
  viewStory,
  deleteStory,
  getStoryViewers,
} from '../../services/storiesService';
import { StoryGroup } from '../../types/story.types';

const { width, height } = Dimensions.get('window');

export const StoriesScreen = ({ route, navigation }: any) => {
  const { user } = useAuthStore();
  const { storyGroups: passedStoryGroups, userIndex = 0, storyIndex = 0 } = route.params || {};

  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>(passedStoryGroups || []);
  const [loading, setLoading] = useState(!passedStoryGroups);

  const [currentUserIndex, setCurrentUserIndex] = useState(userIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(storyIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentUserGroup = storyGroups[currentUserIndex];
  const currentStory = currentUserGroup?.stories[currentStoryIndex];

  // Load stories if not passed via route params
  useEffect(() => {
    if (!passedStoryGroups && user?.id) {
      loadStories();
    }
  }, [user?.id]);

  const loadStories = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // For now, we'll get stories from the current user only
      // In a real app, you'd fetch the user's following list first
      const stories = await getFeedStories(user.id, []);
      setStoryGroups(stories);
    } catch (error) {
      console.error('Error loading stories:', error);
      Alert.alert('Error', 'Failed to load stories');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && user?.id && !loading) {
      viewStory(currentStory.id, user.id).catch((error) => {
        console.error('Error marking story as viewed:', error);
      });
    }
  }, [currentStory?.id, user?.id, loading]);

  // Animate progress bar
  useEffect(() => {
    if (!isPaused && currentStory && !loading) {
      const duration = currentStory.duration * 1000; // Convert to milliseconds
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });

      return () => {
        progressAnim.stopAnimation();
      };
    }
  }, [currentUserIndex, currentStoryIndex, isPaused, loading]);

  const handleNext = () => {
    progressAnim.setValue(0);

    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      // Next story in current user
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < storyGroups.length - 1) {
      // Next user's first story
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      // End of all stories
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    progressAnim.setValue(0);

    if (currentStoryIndex > 0) {
      // Previous story in current user
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      // Previous user's last story
      const prevUserIndex = currentUserIndex - 1;
      setCurrentUserIndex(prevUserIndex);
      setCurrentStoryIndex(storyGroups[prevUserIndex].stories.length - 1);
    } else {
      // At the beginning
      navigation.goBack();
    }
  };

  const handleDeleteStory = async () => {
    if (!currentStory || !user?.id) return;

    // Only allow deletion of own stories
    if (currentStory.userId !== user.id) {
      Alert.alert('Error', 'You can only delete your own stories');
      return;
    }

    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStory(currentStory.id, user.id);
              // Remove story from local state
              const updatedGroups = [...storyGroups];
              const currentGroup = updatedGroups[currentUserIndex];
              currentGroup.stories = currentGroup.stories.filter(s => s.id !== currentStory.id);

              if (currentGroup.stories.length === 0) {
                // Remove the entire group if no stories left
                updatedGroups.splice(currentUserIndex, 1);
                if (updatedGroups.length === 0) {
                  navigation.goBack();
                  return;
                }
              }

              setStoryGroups(updatedGroups);
              handleNext();
            } catch (error) {
              console.error('Error deleting story:', error);
              Alert.alert('Error', 'Failed to delete story');
            }
          },
        },
      ]
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsPaused(true);
        progressAnim.stopAnimation();
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsPaused(false);

        // Swipe left/right to navigate
        if (Math.abs(gestureState.dx) > 50) {
          if (gestureState.dx > 0) {
            handlePrevious();
          } else {
            handleNext();
          }
        } else if (gestureState.dx === 0) {
          // Tap left/right to navigate
          if (gestureState.x0 < width / 3) {
            handlePrevious();
          } else if (gestureState.x0 > (width * 2) / 3) {
            handleNext();
          }
        }
      },
    })
  ).current;

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const diffInMs = Date.now() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  if (!currentUserGroup || !currentStory || storyGroups.length === 0) {
    navigation.goBack();
    return null;
  }

  const isOwnStory = currentStory.userId === user?.id;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Story Image/Content */}
      <View style={styles.storyContent}>
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={styles.storyImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.3)']}
          style={styles.gradient}
        />
      </View>

      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {currentUserGroup.stories.map((_, index) => (
          <View key={index} style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width:
                    index < currentStoryIndex
                      ? '100%'
                      : index === currentStoryIndex
                      ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            name={currentUserGroup.userName}
            imageUrl={currentUserGroup.userAvatar}
            size="sm"
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>{currentUserGroup.userName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(currentStory.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {isOwnStory && (
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteStory}>
              <Ionicons name="trash-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption */}
      {currentStory.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{currentStory.caption}</Text>
        </View>
      )}

      {/* View Count (for own stories) */}
      {isOwnStory && currentStory.viewCount > 0 && (
        <View style={styles.viewCountContainer}>
          <Ionicons name="eye" size={16} color="#FFF" />
          <Text style={styles.viewCountText}>{currentStory.viewCount} views</Text>
        </View>
      )}

      {/* Tap Zones (for debugging in dev) */}
      {__DEV__ && (
        <>
          <View style={[styles.tapZone, { left: 0 }]} />
          <View style={[styles.tapZone, { right: 0 }]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyContent: {
    flex: 1,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  header: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  userText: {
    gap: 2,
  },
  userName: {
    ...textStyles.body,
    color: '#FFF',
    fontWeight: '700',
  },
  timestamp: {
    ...textStyles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.md,
    borderRadius: 12,
    zIndex: 10,
  },
  captionText: {
    ...textStyles.body,
    color: '#FFF',
  },
  viewCountContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    zIndex: 10,
  },
  viewCountText: {
    ...textStyles.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  tapZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width / 3,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
});
