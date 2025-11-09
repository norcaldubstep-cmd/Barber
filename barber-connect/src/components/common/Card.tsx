import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  onPress?: () => void;
  style?: ViewStyle;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  gradient = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.8 : 1}
        style={[cardStyle, { padding: 0, overflow: 'hidden' }]}
      >
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.1)', 'rgba(255, 215, 0, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  default: {
    backgroundColor: colors.background.card,
  },
  elevated: {
    backgroundColor: colors.background.card,
    ...shadows.lg,
  },
  outlined: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  gradient: {
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    padding: spacing.lg,
  },
});
