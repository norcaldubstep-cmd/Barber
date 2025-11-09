import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../../theme';

interface LikeButtonProps {
  initialLiked?: boolean;
  initialCount?: number;
  onLike?: (liked: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  initialLiked = false,
  initialCount = 0,
  onLike,
  size = 'medium',
  showCount = true,
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [scaleAnim] = useState(new Animated.Value(1));

  const iconSize = size === 'small' ? 18 : size === 'medium' ? 22 : 26;

  const handlePress = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    // Animate
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onLike?.(newLiked);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={iconSize}
          color={liked ? colors.error : colors.text.secondary}
        />
      </Animated.View>
      {showCount && (
        <Text style={[styles.count, liked && styles.countLiked]}>
          {likeCount > 0 ? likeCount : ''}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  count: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
    minWidth: 20,
  },
  countLiked: {
    color: colors.error,
  },
});
