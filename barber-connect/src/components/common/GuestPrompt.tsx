import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from './Button';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';

interface GuestPromptProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  feature?: string;
  description?: string;
}

export const GuestPrompt: React.FC<GuestPromptProps> = ({
  visible,
  onClose,
  onSignUp,
  onSignIn,
  feature = 'this feature',
  description = 'Create an account to unlock all features and connect with barbers.',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <LinearGradient
              colors={['#1A1A1A', '#000000']}
              style={styles.gradient}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#D4AF37', '#E8C869']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="person-add" size={32} color="#000" />
                </LinearGradient>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title}>Sign Up Required</Text>
                <Text style={styles.description}>
                  To use {feature}, you'll need to create an account.
                </Text>
                <Text style={styles.subdescription}>{description}</Text>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="calendar" size={20} color={colors.accent.gold} />
                  <Text style={styles.featureText}>Book appointments</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="chatbubbles" size={20} color={colors.accent.gold} />
                  <Text style={styles.featureText}>Message barbers</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="heart" size={20} color={colors.accent.gold} />
                  <Text style={styles.featureText}>Save favorites</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={20} color={colors.accent.gold} />
                  <Text style={styles.featureText}>Follow & engage</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Sign Up"
                  onPress={onSignUp}
                  variant="gradient"
                  size="large"
                  fullWidth
                />
                <Button
                  title="Sign In"
                  onPress={onSignIn}
                  variant="outline"
                  size="large"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
                <TouchableOpacity onPress={onClose} style={styles.continueButton}>
                  <Text style={styles.continueText}>Continue Browsing</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  gradient: {
    padding: spacing['2xl'],
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h2,
    color: colors.text.inverse,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subdescription: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.medium,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...textStyles.body,
    color: colors.text.secondary,
    flex: 1,
  },
  actions: {
    gap: spacing.xs,
  },
  continueButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  continueText: {
    ...textStyles.bodySmall,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
});
