import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { signIn as authSignIn } from '../../services/authService';
import { Alert } from 'react-native';

export const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Sign in with Firebase
      const user = await authSignIn(email.trim(), password);

      // Store user in auth store
      await signIn(user, 'firebase-auth');

      // Navigation is handled by authStore
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in. Please check your credentials.';
      setErrors({ password: errorMessage });
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#D4AF37', '#E8C869']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="cut" size={40} color="#000" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to BarberConnect</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                icon="lock-closed-outline"
                isPassword
                required
              />

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Sign In"
                onPress={handleSignIn}
                variant="gradient"
                size="large"
                fullWidth
                isLoading={isLoading}
                style={{ marginTop: spacing.md }}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Continue with Google"
                onPress={() => console.log('Google sign in')}
                variant="outline"
                size="large"
                fullWidth
                icon="logo-google"
              />

              <Button
                title="Continue with Apple"
                onPress={() => console.log('Apple sign in')}
                variant="outline"
                size="large"
                fullWidth
                icon="logo-apple"
                style={{ marginTop: spacing.md }}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('RoleSelection')}
                style={styles.signUpLink}
              >
                <Text style={styles.signUpText}>
                  Don't have an account? <Text style={styles.signUpTextBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.main },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing['3xl'], paddingBottom: spacing['4xl'] },
  backButton: { width: 40, height: 40, marginBottom: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  logoContainer: { marginBottom: spacing.lg },
  logoGradient: { width: 80, height: 80, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  title: { ...textStyles.h1, color: colors.text.inverse, marginBottom: spacing.sm },
  subtitle: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
  form: { gap: spacing.sm },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing.sm },
  rememberMe: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.accent.gold, borderColor: colors.accent.gold },
  rememberMeText: { ...textStyles.bodySmall, color: colors.text.secondary },
  forgotPassword: { ...textStyles.bodySmall, color: colors.accent.gold, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.medium },
  dividerText: { ...textStyles.bodySmall, color: colors.text.secondary, marginHorizontal: spacing.md },
  signUpLink: { alignItems: 'center', marginTop: spacing.xl },
  signUpText: { ...textStyles.body, color: colors.text.secondary },
  signUpTextBold: { color: colors.accent.gold, fontWeight: '700' },
});
