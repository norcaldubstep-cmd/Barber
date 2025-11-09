import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface SocialAuthButtonsProps {
  mode?: 'signin' | 'signup';
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode = 'signin' }) => {
  const actionText = mode === 'signin' ? 'Sign in' : 'Sign up';

  const handleGoogleAuth = async () => {
    Alert.alert('Google Sign In', 'Google authentication will be integrated with the backend.');
  };

  const handleAppleAuth = async () => {
    Alert.alert('Apple Sign In', 'Apple authentication will be integrated with the backend.');
  };

  const handleFacebookAuth = async () => {
    Alert.alert('Facebook Sign In', 'Facebook authentication will be integrated with the backend.');
  };

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or {actionText} with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialButtons}>
        {/* Google */}
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleAuth}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={24} color="#DB4437" />
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          style={[styles.socialButton, styles.appleButton]}
          onPress={handleAppleAuth}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-apple" size={24} color="#000" />
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity
          style={[styles.socialButton, styles.facebookButton]}
          onPress={handleFacebookAuth}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.medium,
  },
  dividerText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
  },
  facebookButton: {
    backgroundColor: '#FFFFFF',
  },
});
