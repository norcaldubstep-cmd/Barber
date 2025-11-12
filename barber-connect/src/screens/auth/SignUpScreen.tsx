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
import { UserRole } from '../../types/user.types';
import { useAuthStore } from '../../store/authStore';
import { signUp } from '../../services/authService';
import { Alert } from 'react-native';

interface SignUpScreenProps {
  navigation: any;
  route: {
    params: {
      role: UserRole;
      isBusinessOwner: boolean;
    };
  };
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation, route }) => {
  const { role, isBusinessOwner } = route.params;
  const { signIn } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    businessName: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (role === UserRole.BARBER && !formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (isBusinessOwner && !formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the terms';
    }

    if (!formData.acceptedPrivacy) {
      newErrors.acceptedPrivacy = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Create user with Firebase
      const user = await signUp(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        role,
        isBusinessOwner
      );

      // Sign in the user
      await signIn(user, 'firebase-auth');

      // Show success message
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account.',
        [{ text: 'OK' }]
      );

      // Navigation will happen automatically via RootNavigator
    } catch (error: any) {
      // console.error('Sign up error:', error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      Alert.alert('Sign Up Failed', errorMessage);
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case UserRole.CLIENT:
        return 'person-outline';
      case UserRole.BARBER:
        return 'cut-outline';
      default:
        return 'person-outline';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case UserRole.CLIENT:
        return colors.accent.blue;
      case UserRole.BARBER:
        return colors.accent.gold;
      default:
        return colors.accent.blue;
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
              <View style={[styles.roleIcon, { backgroundColor: getRoleColor() + '20' }]}>
                <Ionicons name={getRoleIcon()} size={32} color={getRoleColor()} />
              </View>
              <Text style={styles.title}>
                Create {role === UserRole.BARBER ? 'Barber' : 'Client'} Account
              </Text>
              {isBusinessOwner && (
                <View style={styles.businessBadge}>
                  <Ionicons name="business" size={16} color={colors.accent.red} />
                  <Text style={styles.businessBadgeText}>Business Owner</Text>
                </View>
              )}
              <Text style={styles.subtitle}>Join the premier barber community</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  error={errors.firstName}
                  icon="person-outline"
                  required
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  error={errors.lastName}
                  required
                  containerStyle={styles.halfInput}
                />
              </View>

              {role === UserRole.BARBER && (
                <Input
                  label="Display Name"
                  placeholder="How clients will see you"
                  value={formData.displayName}
                  onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                  error={errors.displayName}
                  icon="create-outline"
                  required
                  helperText="This is your professional name on the platform"
                />
              )}

              {isBusinessOwner && (
                <Input
                  label="Business Name"
                  placeholder="Your barbershop name"
                  value={formData.businessName}
                  onChangeText={(text) => setFormData({ ...formData, businessName: text })}
                  error={errors.businessName}
                  icon="business-outline"
                  required
                />
              )}

              <Input
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                error={errors.email}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Input
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                icon="call-outline"
                keyboardType="phone-pad"
                helperText="For booking confirmations and updates"
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                error={errors.password}
                icon="lock-closed-outline"
                isPassword
                required
              />

              <Input
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                error={errors.confirmPassword}
                icon="lock-closed-outline"
                isPassword
                required
              />

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })
                  }
                >
                  <View style={[styles.checkboxBox, formData.acceptedTerms && styles.checkboxBoxChecked]}>
                    {formData.acceptedTerms && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.checkboxText}>
                    I agree to the <Text style={styles.link}>Terms and Conditions</Text>
                  </Text>
                </TouchableOpacity>
                {errors.acceptedTerms && (
                  <Text style={styles.checkboxError}>{errors.acceptedTerms}</Text>
                )}
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({ ...formData, acceptedPrivacy: !formData.acceptedPrivacy })
                  }
                >
                  <View style={[styles.checkboxBox, formData.acceptedPrivacy && styles.checkboxBoxChecked]}>
                    {formData.acceptedPrivacy && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.checkboxText}>
                    I agree to the <Text style={styles.link}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {errors.acceptedPrivacy && (
                  <Text style={styles.checkboxError}>{errors.acceptedPrivacy}</Text>
                )}
              </View>

              <Button
                title="Create Account"
                onPress={handleSignUp}
                variant="gradient"
                size="large"
                fullWidth
                isLoading={isLoading}
                style={{ marginTop: spacing.lg }}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Continue with Google"
                onPress={() => console.log('Google sign up')}
                variant="outline"
                size="large"
                fullWidth
                icon="logo-google"
              />

              <Button
                title="Continue with Apple"
                onPress={() => console.log('Apple sign up')}
                variant="outline"
                size="large"
                fullWidth
                icon="logo-apple"
                style={{ marginTop: spacing.md }}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('SignIn')}
                style={styles.signInLink}
              >
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
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
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  backButton: { width: 40, height: 40, marginBottom: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...textStyles.h2, color: colors.text.inverse, marginBottom: spacing.sm, textAlign: 'center' },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent.red + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  businessBadgeText: { ...textStyles.caption, color: colors.accent.red, fontWeight: '700' },
  subtitle: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
  form: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  halfInput: { flex: 1 },
  checkboxContainer: { marginVertical: spacing.xs },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: { backgroundColor: colors.accent.gold, borderColor: colors.accent.gold },
  checkboxText: { ...textStyles.bodySmall, color: colors.text.secondary, flex: 1 },
  checkboxError: { ...textStyles.caption, color: colors.error, marginTop: spacing.xs, marginLeft: 32 },
  link: { color: colors.accent.gold, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.medium },
  dividerText: { ...textStyles.bodySmall, color: colors.text.secondary, marginHorizontal: spacing.md },
  signInLink: { alignItems: 'center', marginTop: spacing.lg },
  signInText: { ...textStyles.body, color: colors.text.secondary },
  signInTextBold: { color: colors.accent.gold, fontWeight: '700' },
});
