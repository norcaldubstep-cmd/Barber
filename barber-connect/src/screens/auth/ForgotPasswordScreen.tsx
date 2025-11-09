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

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Check Your Email',
        `We've sent a verification code to ${email}. Please check your inbox.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResetPassword', { email }),
          },
        ]
      );
    }, 1500);
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
              <Ionicons name="lock-closed" size={48} color="#000" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email address and we'll send you a verification code to reset
            your password.
          </Text>

          {/* Email Input */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail"
              error={errors.email}
            />
          </View>

          {/* Send Button */}
          <Button
            title="Send Verification Code"
            onPress={handleSendCode}
            variant="gradient"
            size="large"
            fullWidth
            loading={loading}
            disabled={loading}
            style={styles.sendButton}
          />

          {/* Back to Sign In */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backToSignIn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-circle" size={20} color={colors.accent.gold} />
            <Text style={styles.backToSignInText}>Back to Sign In</Text>
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
  },
  sendButton: {
    marginBottom: spacing.xl,
  },
  backToSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  backToSignInText: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '600',
  },
});
