import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../../theme';

interface CommentButtonProps {
  count?: number;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export const CommentButton: React.FC<CommentButtonProps> = ({
  count = 0,
  onPress,
  size = 'medium',
  showCount = true,
}) => {
  const iconSize = size === 'small' ? 18 : size === 'medium' ? 22 : 26;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Ionicons
        name="chatbubble-outline"
        size={iconSize}
        color={colors.text.secondary}
      />
      {showCount && count > 0 && (
        <Text style={styles.count}>{count}</Text>
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
});
