import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

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
  const iconColor = variant === 'primary' || variant === 'gradient' ? colors.text.inverse : colors.primary.main;

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator color={iconColor} />
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
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.8} style={[buttonStyle, { padding: 0, overflow: 'hidden' }]}>
        <LinearGradient
          colors={['#D4AF37', '#FFD700', '#F4E5AD', '#FFD700', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.7} style={buttonStyle}>
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
    gap: spacing.sm,
  },
  fullWidth: { width: '100%' },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // Sizes
  small: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  medium: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 44 },
  large: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 52 },

  // Variants
  primaryContainer: { backgroundColor: colors.primary.main },
  secondaryContainer: { backgroundColor: colors.neutral[100] },
  outlineContainer: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary.main },
  ghostContainer: { backgroundColor: 'transparent' },
  gradientContainer: { padding: 0 },
  dangerContainer: { backgroundColor: colors.error },

  // Text Styles
  text: { ...textStyles.button, fontWeight: '700' },
  smallText: { fontSize: 14 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 18 },
  primaryText: { color: colors.text.inverse },
  secondaryText: { color: colors.text.primary },
  outlineText: { color: colors.primary.main },
  ghostText: { color: colors.primary.main },
  gradientText: { color: colors.text.inverse, fontWeight: '800' },
  dangerText: { color: colors.text.inverse },

  // States
  disabled: { opacity: 0.5 },
  disabledText: { opacity: 0.7 },
});
