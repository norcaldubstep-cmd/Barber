import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1A1A1A', '#000000']}
        style={styles.gradient}
      >
        {/* Animated Background Pattern */}
        <View style={styles.backgroundPattern}>
          <Ionicons name="cut" size={200} color="rgba(212, 175, 55, 0.05)" style={styles.patternIcon1} />
          <Ionicons name="cut" size={150} color="rgba(212, 175, 55, 0.03)" style={styles.patternIcon2} />
        </View>

        {/* Logo & Branding */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700', '#D4AF37']}
            style={styles.logoContainer}
          >
            <Ionicons name="cut" size={48} color="#000" />
          </LinearGradient>
          <Text style={styles.brandName}>BarberConnect</Text>
          <Text style={styles.tagline}>Where Barbers & Clients Connect</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'cut-outline' as const, text: 'Find Top Barbers' },
            { icon: 'calendar-outline' as const, text: 'Book Instantly' },
            { icon: 'people-outline' as const, text: 'Build Your Brand' },
            { icon: 'trending-up-outline' as const, text: 'Grow Your Business' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={24} color={colors.accent.gold} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('RoleSelection')}
            variant="gradient"
            size="large"
            fullWidth
            icon="arrow-forward"
            iconPosition="right"
          />
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('SignIn')}
            variant="outline"
            size="large"
            fullWidth
            style={styles.signInButton}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
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
  backgroundPattern: {
    position: 'absolute',
    width: width,
    height: height,
  },
  patternIcon1: {
    position: 'absolute',
    top: 100,
    right: -50,
    transform: [{ rotate: '15deg' }],
  },
  patternIcon2: {
    position: 'absolute',
    bottom: 150,
    left: -30,
    transform: [{ rotate: '-25deg' }],
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['5xl'],
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...StyleSheet.create({ shadow: { elevation: 10, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 } }).shadow,
  },
  brandName: {
    ...textStyles.h1,
    fontSize: 42,
    color: colors.text.inverse,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...textStyles.body,
    color: colors.accent.gold,
    fontWeight: '600',
  },
  features: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    ...textStyles.bodyLarge,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  signInButton: {
    borderColor: colors.accent.gold,
    borderWidth: 2,
  },
  footer: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
});
