import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  fullScreen = false,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.content}>
        <LinearGradient
          colors={['#D4AF37', '#FFD700', '#D4AF37']}
          style={[
            styles.logoContainer,
            { width: getSize() * 2.5, height: getSize() * 2.5, borderRadius: getSize() * 1.25 },
          ]}
        >
          <Ionicons name="cut" size={getSize()} color="#000" />
        </LinearGradient>
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'large'}
          color={colors.accent.gold}
          style={styles.spinner}
        />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );

  return content;
};

// Overlay Loading (for when something is loading over existing content)
export const LoadingOverlay: React.FC<{ visible: boolean; text?: string }> = ({
  visible,
  text,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Loading size="large" text={text} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  spinner: {
    marginTop: spacing.sm,
  },
  text: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minWidth: 200,
  },
});
