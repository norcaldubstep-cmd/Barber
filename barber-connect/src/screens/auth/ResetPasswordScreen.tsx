import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

export const ResetPasswordScreen = ({ navigation, route }: any) => {
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = 'Verification code is required';
    } else if (code.length < 6) {
      newErrors.code = 'Please enter a valid 6-digit code';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('SignIn'),
          },
        ]
      );
    }, 1500);
  };

  const handleResendCode = () => {
    Alert.alert('Code Sent', `A new verification code has been sent to ${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#D4AF37', '#FFD700']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="key" size={48} color="#000" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the verification code sent to {email || 'your email'} and create a new password.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                if (errors.code) setErrors({ ...errors, code: '' });
              }}
              keyboardType="number-pad"
              maxLength={6}
              leftIcon="shield-checkmark"
              error={errors.code}
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors.confirmPassword}
            />
          </View>

          {/* Reset Button */}
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            variant="gradient"
            size="large"
            fullWidth
            loading={loading}
            disabled={loading}
            style={styles.resetButton}
          />

          {/* Resend Code */}
          <TouchableOpacity
            onPress={handleResendCode}
            style={styles.resendButton}
            activeOpacity={0.7}
          >
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.h1,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['3xl'],
  },
  form: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  resetButton: {
    marginBottom: spacing.xl,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  resendLink: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '700',
  },
});
