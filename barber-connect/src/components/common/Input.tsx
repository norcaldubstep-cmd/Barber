import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle, TextInputProps, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  isPassword = false,
  containerStyle,
  required = false,
  helperText,
  rightElement,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border.light, error ? colors.error : colors.accent.gold],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Animated.View style={[styles.inputContainer, { borderColor }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? colors.error : isFocused ? colors.accent.gold : colors.text.secondary}
            style={styles.icon}
          />
        )}
        <TextInput
          {...textInputProps}
          style={[styles.input, textInputProps.style]}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        {rightElement}
      </Animated.View>
      {(error || helperText) && (
        <Text style={error ? styles.error : styles.helper}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  required: { color: colors.error },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  eyeIcon: { padding: spacing.xs },
  error: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helper: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
