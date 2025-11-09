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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, textStyles } from '../../theme';

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  imageUrl?: string;
  duration: number;
  timestamp: Date;
}

interface StoryUser {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  stories: Story[];
}

const MOCK_STORIES: StoryUser[] = [
  {
    id: '1',
    name: 'Mike the Barber',
    isVerified: true,
    stories: [
      {
        id: 's1',
        imageUrl: 'https://via.placeholder.com/400x800/1a1a1a/ffffff?text=Fresh+Fade',
        duration: 5000,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 's2',
        imageUrl: 'https://via.placeholder.com/400x800/2a2a2a/ffffff?text=New+Setup',
        duration: 5000,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
    ],
  },
];

export const StoriesScreen = ({ route, navigation }: any) => {
  const { userIndex = 0, storyIndex = 0 } = route.params || {};

  const [currentUserIndex, setCurrentUserIndex] = useState(userIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(storyIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const currentUser = MOCK_STORIES[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];

  useEffect(() => {
    if (!isPaused && currentStory) {
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: currentStory.duration,
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
  }, [currentUserIndex, currentStoryIndex, isPaused]);

  const handleNext = () => {
    progressAnim.setValue(0);

    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Next story in current user
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < MOCK_STORIES.length - 1) {
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
      setCurrentStoryIndex(MOCK_STORIES[prevUserIndex].stories.length - 1);
    } else {
      // At the beginning
      navigation.goBack();
    }
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

  const formatTimestamp = (date: Date): string => {
    const diffInMs = Date.now() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!currentUser || !currentStory) {
    navigation.goBack();
    return null;
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Story Image/Content */}
      <View style={styles.storyContent}>
        <Image
          source={{ uri: currentStory.imageUrl }}
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
        {currentUser.stories.map((_, index) => (
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
          <Avatar name={currentUser.name} size="sm" verified={currentUser.isVerified} />
          <View style={styles.userText}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(currentStory.timestamp)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width / 3,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
});
