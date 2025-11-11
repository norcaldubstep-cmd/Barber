import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || isLoading;

  const buttonStyle = [
    styles.base,
    styles[size],
    styles[`${variant}Container`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  // Refined icon colors for each variant
  const getIconColor = () => {
    if (variant === 'gradient') return '#000';
    if (variant === 'primary' || variant === 'danger') return colors.text.inverse;
    if (variant === 'outline') return colors.accent.gold;
    return colors.primary.main;
  };

  const iconColor = getIconColor();

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator color={iconColor} size={size === 'large' ? 'large' : 'small'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Ionicons name={icon} size={iconSize} color={iconColor} />}
          <Text style={buttonTextStyle}>{title}</Text>
          {icon && iconPosition === 'right' && <Ionicons name={icon} size={iconSize} color={iconColor} />}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[buttonStyle, styles.gradientWrapper]}
      >
        <LinearGradient
          colors={['#D4AF37', '#E8C869']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, styles[`${size}Gradient`]]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.75} style={buttonStyle}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  fullWidth: { width: '100%' },

  // Gradient wrapper with shadow
  gradientWrapper: {
    padding: 0,
    overflow: 'hidden',
    ...shadows.md,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.25,
  },

  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // Sizes
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg + 4,
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 54,
  },

  // Gradient sizes (padding inside gradient)
  smallGradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  mediumGradient: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg + 4,
    gap: spacing.sm,
  },
  largeGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },

  // Variants
  primaryContainer: {
    backgroundColor: colors.primary.main,
    ...shadows.sm,
  },
  secondaryContainer: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent.gold,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    padding: 0,
  },
  dangerContainer: {
    backgroundColor: colors.error,
    ...shadows.sm,
  },

  // Text Styles
  text: {
    ...textStyles.button,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  smallText: { fontSize: 14, lineHeight: 16 },
  mediumText: { fontSize: 16, lineHeight: 19 },
  largeText: { fontSize: 18, lineHeight: 21 },

  primaryText: { color: colors.text.inverse },
  secondaryText: { color: colors.text.primary },
  outlineText: { color: colors.accent.gold, fontWeight: '600' },
  ghostText: { color: colors.primary.main },
  gradientText: {
    color: '#000',
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  dangerText: { color: colors.text.inverse },

  // States
  disabled: { opacity: 0.5 },
  disabledText: { opacity: 0.8 },
});
