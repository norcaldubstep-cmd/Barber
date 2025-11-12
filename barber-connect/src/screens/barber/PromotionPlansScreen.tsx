import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { PROMOTION_PLANS, PromotionTier } from '../../types/promotion.types';
import { useAuthStore } from '../../store/authStore';
import { getBarberProfile } from '../../services/barberService';

export const PromotionPlansScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [currentTier, setCurrentTier] = useState<PromotionTier>(PromotionTier.FREE);
  const [selectedTier, setSelectedTier] = useState<PromotionTier>(PromotionTier.SILVER);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentTier();
  }, []);

  const loadCurrentTier = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setLoading(true);
      const profile = await getBarberProfile(user.id);
      if (profile && profile.promotionTier) {
        setCurrentTier(profile.promotionTier);
        setSelectedTier(profile.promotionTier);
      }
    } catch (err) {
      // console.error('Load tier error:', err);
      Alert.alert('Error', 'Failed to load current plan');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PROMOTION_PLANS.find((p) => p.tier === selectedTier);

  const getMonthlyPrice = (tier: PromotionTier): number => {
    const plan = PROMOTION_PLANS.find((p) => p.tier === tier);
    if (!plan || plan.price === 0) return 0;
    return billingCycle === 'monthly' ? plan.price : Math.floor(plan.price * 0.83);
  };

  const getYearlySavings = (tier: PromotionTier): number => {
    const plan = PROMOTION_PLANS.find((p) => p.tier === tier);
    if (!plan || plan.price === 0) return 0;
    const monthlyTotal = plan.price * 12;
    const yearlyTotal = Math.floor(plan.price * 0.83) * 12;
    return monthlyTotal - yearlyTotal;
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    if (selectedPlan.tier === currentTier) {
      Alert.alert('Current Plan', `You are already on the ${selectedPlan.name} plan`);
      return;
    }

    const price = getMonthlyPrice(selectedPlan.tier);
    const total = billingCycle === 'monthly' ? price : price * 12;

    Alert.alert(
      'Upgrade Plan',
      `This would upgrade you to ${selectedPlan.name} plan for $${total}/${billingCycle === 'monthly' ? 'month' : 'year'}. Payment processing is not yet implemented.`,
      [
        { text: 'OK', style: 'default' },
      ]
    );
  };

  const renderPlanCard = (tier: PromotionTier) => {
    const plan = PROMOTION_PLANS.find((p) => p.tier === tier);
    if (!plan) return null;

    const isSelected = selectedTier === tier;
    const isFree = plan.price === 0;
    const monthlyPrice = getMonthlyPrice(tier);
    const savings = getYearlySavings(tier);

    return (
      <TouchableOpacity
        key={tier}
        onPress={() => setSelectedTier(tier)}
        activeOpacity={0.9}
      >
        <Card
          style={[
            styles.planCard,
            isSelected && styles.planCardSelected,
            plan.isPopular && styles.popularCard,
            tier === currentTier && styles.currentPlanCard,
          ]}
        >
          {tier === currentTier && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>CURRENT PLAN</Text>
            </View>
          )}
          {plan.isPopular && (
            <View style={styles.popularBadge}>
              <LinearGradient colors={['#D4AF37', '#E8C869']} style={styles.popularGradient}>
                <Ionicons name="star" size={12} color="#000" />
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.planHeader}>
            <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
              <Ionicons name={plan.icon} size={32} color={plan.color} />
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </View>

          <View style={styles.priceContainer}>
            {isFree ? (
              <Text style={styles.freeText}>Free Forever</Text>
            ) : (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.price}>{monthlyPrice}</Text>
                  <Text style={styles.period}>/mo</Text>
                </View>
                {billingCycle === 'yearly' && savings > 0 && (
                  <Text style={styles.savings}>Save ${savings}/year</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.featuresContainer}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={28} color={colors.accent.gold} />
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Promotion Plans</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotion Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#D4AF37', '#E8C869']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Ionicons name="trending-up" size={48} color="#000" />
          <Text style={styles.heroTitle}>Get More Clients</Text>
          <Text style={styles.heroSubtitle}>
            Upgrade to premium and get featured placement in search results
          </Text>
        </LinearGradient>

        {/* Billing Cycle Toggle */}
        <View style={styles.billingToggleContainer}>
          <TouchableOpacity
            style={styles.billingOption}
            onPress={() => setBillingCycle('monthly')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                billingCycle === 'monthly'
                  ? ['#D4AF37', '#FFD700']
                  : [colors.background.secondary, colors.background.secondary]
              }
              style={styles.billingGradient}
            >
              <Text
                style={[
                  styles.billingText,
                  billingCycle === 'monthly' && styles.billingTextActive,
                ]}
              >
                Monthly
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.billingOption}
            onPress={() => setBillingCycle('yearly')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                billingCycle === 'yearly'
                  ? ['#D4AF37', '#FFD700']
                  : [colors.background.secondary, colors.background.secondary]
              }
              style={styles.billingGradient}
            >
              <Text
                style={[
                  styles.billingText,
                  billingCycle === 'yearly' && styles.billingTextActive,
                ]}
              >
                Yearly
              </Text>
              {billingCycle === 'yearly' && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>Save 17%</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {renderPlanCard(PromotionTier.FREE)}
          {renderPlanCard(PromotionTier.BRONZE)}
          {renderPlanCard(PromotionTier.SILVER)}
          {renderPlanCard(PromotionTier.GOLD)}
          {renderPlanCard(PromotionTier.PLATINUM)}
        </View>

        {/* Comparison Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <Card style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <Ionicons name="search" size={20} color={colors.accent.gold} />
              <Text style={styles.comparisonText}>Priority in search results</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Ionicons name="star" size={20} color={colors.accent.gold} />
              <Text style={styles.comparisonText}>Featured badge on profile</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Ionicons name="analytics" size={20} color={colors.accent.gold} />
              <Text style={styles.comparisonText}>Advanced analytics</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Ionicons name="notifications" size={20} color={colors.accent.gold} />
              <Text style={styles.comparisonText}>New booking alerts</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Ionicons name="chatbubbles" size={20} color={colors.accent.gold} />
              <Text style={styles.comparisonText}>Priority support</Text>
            </View>
          </Card>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. You'll continue to have access
              until the end of your billing period.
            </Text>
          </Card>
          <Card style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How does featured placement work?</Text>
            <Text style={styles.faqAnswer}>
              Premium members appear at the top of search results with a special badge, helping
              you get discovered by more clients.
            </Text>
          </Card>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {selectedPlan && (
          <View style={styles.bottomContent}>
            <View style={styles.bottomInfo}>
              <Text style={styles.bottomPlan}>{selectedPlan.name} Plan</Text>
              <Text style={styles.bottomPrice}>
                ${getMonthlyPrice(selectedTier)}
                {selectedTier !== 'FREE' && `/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}
              </Text>
            </View>
            <Button
              title={selectedTier === currentTier ? 'Current Plan' : 'Upgrade Plan'}
              onPress={handleSubscribe}
              variant="gradient"
              size="large"
              disabled={selectedTier === currentTier}
              icon="rocket"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.h2, fontWeight: '700' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
  hero: {
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTitle: { ...textStyles.h1, fontWeight: '900', color: '#000' },
  heroSubtitle: {
    ...textStyles.body,
    color: 'rgba(0,0,0,0.7)',
    textAlign: 'center',
    maxWidth: 300,
  },
  billingToggleContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  billingOption: { flex: 1 },
  billingGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    position: 'relative',
  },
  billingText: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
  billingTextActive: { color: '#000', fontWeight: '700' },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  saveText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  plansContainer: { paddingHorizontal: spacing.lg, gap: spacing.md },
  planCard: {
    padding: spacing.lg,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: colors.accent.gold,
    ...shadows.md,
  },
  popularCard: { borderColor: colors.accent.gold + '50' },
  currentPlanCard: {
    borderColor: colors.success,
    borderWidth: 3,
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    left: spacing.lg,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  currentText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  popularGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  popularText: { fontSize: 10, fontWeight: '900', color: '#000' },
  planHeader: { alignItems: 'center', marginBottom: spacing.lg },
  planIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  planName: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.xs },
  planDescription: {
    ...textStyles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  priceContainer: { alignItems: 'center', marginBottom: spacing.lg },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  currency: { ...textStyles.h3, fontWeight: '700', marginTop: 4 },
  price: { ...textStyles.h1, fontWeight: '900', fontSize: 48 },
  period: { ...textStyles.body, color: colors.text.secondary, marginTop: 12 },
  freeText: { ...textStyles.h3, color: colors.success, fontWeight: '700' },
  savings: { ...textStyles.caption, color: colors.success, marginTop: spacing.xs },
  featuresContainer: { gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { ...textStyles.bodySmall, color: colors.text.primary, flex: 1 },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  comparisonCard: { padding: spacing.lg, gap: spacing.md },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  comparisonText: { ...textStyles.body, flex: 1 },
  faqCard: { padding: spacing.lg, marginBottom: spacing.md },
  faqQuestion: { ...textStyles.body, fontWeight: '700', marginBottom: spacing.sm },
  faqAnswer: { ...textStyles.bodySmall, color: colors.text.secondary, lineHeight: 20 },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.card,
    ...shadows.lg,
  },
  bottomContent: { gap: spacing.md },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPlan: { ...textStyles.body, fontWeight: '600' },
  bottomPrice: { ...textStyles.h3, color: colors.accent.gold, fontWeight: '700' },
});
