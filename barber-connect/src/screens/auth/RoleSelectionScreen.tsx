import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { UserRole } from '../../types/user.types';

interface RoleOption {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  features: string[];
  recommended?: boolean;
}

const roleOptions: RoleOption[] = [
  {
    role: UserRole.CLIENT,
    title: 'Client',
    subtitle: 'Find and book the perfect barber',
    icon: 'person-outline',
    color: colors.accent.blue,
    features: [
      'Discover top-rated barbers near you',
      'Book appointments 24/7',
      'Save favorite styles & barbers',
      'Get personalized recommendations',
      'Exclusive client rewards program',
    ],
  },
  {
    role: UserRole.BARBER,
    title: 'Barber',
    subtitle: 'Showcase your skills and grow your business',
    icon: 'cut-outline',
    color: colors.accent.gold,
    recommended: true,
    features: [
      'Build professional portfolio',
      'Accept bookings & manage schedule',
      'Post content & tutorials',
      'Connect with 100K+ clients',
      'Sell products & services',
      'Get featured & promoted',
    ],
  },
  {
    role: UserRole.BUSINESS_OWNER,
    title: 'Barbershop Owner',
    subtitle: 'Manage your team and grow your business',
    icon: 'business-outline',
    color: colors.accent.red,
    features: [
      'Manage multiple barbers',
      'Post job openings & hire talent',
      'Offer mentorship programs',
      'Track business analytics',
      'Multi-location support',
      'Promote your brand',
    ],
  },
];

export const RoleSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>Select how you want to use BarberConnect</Text>
          </View>

          {/* Role Cards */}
          <View style={styles.rolesContainer}>
            {roleOptions.map((option) => {
              const isSelected = selectedRole === option.role;
              return (
                <Animated.View
                  key={option.role}
                  style={[
                    { transform: [{ scale: isSelected ? scaleAnim : 1 }] },
                  ]}
                >
                  <Card
                    variant="elevated"
                    onPress={() => handleSelectRole(option.role)}
                    style={[
                      styles.roleCard,
                      isSelected && { borderWidth: 3, borderColor: option.color },
                    ]}
                  >
                    {option.recommended && (
                      <View style={styles.recommendedBadge}>
                        <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.recommendedGradient}>
                          <Ionicons name="star" size={12} color="#000" />
                          <Text style={styles.recommendedText}>RECOMMENDED</Text>
                        </LinearGradient>
                      </View>
                    )}

                    {/* Icon */}
                    <LinearGradient
                      colors={[option.color + '30', option.color + '10']}
                      style={styles.iconContainer}
                    >
                      <Ionicons name={option.icon} size={40} color={option.color} />
                    </LinearGradient>

                    {/* Title */}
                    <Text style={styles.roleTitle}>{option.title}</Text>
                    <Text style={styles.roleSubtitle}>{option.subtitle}</Text>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                      {option.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <View style={[styles.checkIcon, { backgroundColor: option.color + '20' }]}>
                            <Ionicons name="checkmark" size={14} color={option.color} />
                          </View>
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: option.color }]}>
                        <Ionicons name="checkmark-circle" size={28} color="#FFF" />
                      </View>
                    )}
                  </Card>
                </Animated.View>
              );
            })}
          </View>

          {/* Continue Button */}
          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={() => navigation.navigate('SignUp', { role: selectedRole })}
              variant="gradient"
              size="large"
              fullWidth
              disabled={!selectedRole}
              icon="arrow-forward"
              iconPosition="right"
            />
            <Button
              title="Already have an account? Sign In"
              onPress={() => navigation.navigate('SignIn')}
              variant="ghost"
              size="medium"
              fullWidth
              style={styles.signInButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h1,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  rolesContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  roleCard: {
    position: 'relative',
    padding: spacing.xl,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  recommendedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleSubtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  featuresContainer: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    ...textStyles.bodySmall,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: spacing.md,
  },
  signInButton: {
    marginTop: spacing.sm,
  },
});
