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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { PROMOTION_PLANS, PromotionTier } from '../../types/promotion.types';
import { Subscription } from '../../types/payment.types';
import {
  getActiveSubscription,
  cancelSubscription,
  reactivateSubscription,
  getPaymentHistory,
} from '../../services/paymentService';
import { getBarberFeatureLimits } from '../../services/featureEnforcementService';
import { useAuthStore } from '../../store/authStore';
import { getBarberProfile } from '../../services/barberService';

export const SubscriptionManagementScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [featureLimits, setFeatureLimits] = useState<any>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get barber profile to get barberId
      const profile = await getBarberProfile(user.id);
      if (!profile) {
        Alert.alert('Error', 'Barber profile not found');
        return;
      }

      // Load subscription
      const sub = await getActiveSubscription(profile.id);
      setSubscription(sub);

      // Load feature limits
      const limits = await getBarberFeatureLimits(profile.id);
      setFeatureLimits(limits);
    } catch (error) {
      console.error('Error loading subscription:', error);
      Alert.alert('Error', 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    Alert.alert(
      'Cancel Subscription',
      'Your subscription will remain active until the end of the current billing period. You will not be charged again.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelLoading(true);
              await cancelSubscription(subscription.id);
              Alert.alert('Success', 'Subscription canceled successfully');
              await loadSubscription();
            } catch (error) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setCancelLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    try {
      setCancelLoading(true);
      await reactivateSubscription(subscription.id);
      Alert.alert('Success', 'Subscription reactivated successfully');
      await loadSubscription();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigation.navigate('PromotionPlans');
  };

  const handleViewPaymentHistory = () => {
    navigation.navigate('PaymentHistory');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const plan = subscription
    ? PROMOTION_PLANS.find((p) => p.tier === subscription.tier)
    : PROMOTION_PLANS[0]; // Free tier

  const isFree = !subscription || subscription.tier === PromotionTier.FREE;
  const isActive = subscription?.status === 'active';
  const willCancel = subscription?.cancelAtPeriodEnd;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Card */}
        <Card style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planLabel}>Current Plan</Text>
              <View style={styles.planNameRow}>
                <Text style={styles.planName}>{plan?.name}</Text>
                {plan && plan.tier !== PromotionTier.FREE && (
                  <View style={[styles.badge, { backgroundColor: plan.color }]}>
                    <Ionicons name={plan.icon as any} size={16} color="#FFF" />
                  </View>
                )}
              </View>
            </View>
            {!isFree && (
              <Text style={styles.planPrice}>
                ${subscription?.pricePerCycle || plan?.price}/
                {subscription?.billingCycle === 'yearly' ? 'year' : 'mo'}
              </Text>
            )}
          </View>

          {subscription && isActive && (
            <View style={styles.planDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.detailText}>
                  Renews on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              {willCancel && (
                <View style={[styles.detailRow, styles.warningRow]}>
                  <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                  <Text style={[styles.detailText, styles.warningText]}>
                    Subscription will cancel at period end
                  </Text>
                </View>
              )}
            </View>
          )}

          {!isFree && isActive && (
            <View style={styles.planActions}>
              {willCancel ? (
                <Button
                  title="Reactivate Subscription"
                  onPress={handleReactivateSubscription}
                  variant="primary"
                  size="medium"
                  isLoading={cancelLoading}
                />
              ) : (
                <>
                  <Button
                    title="Upgrade Plan"
                    onPress={handleUpgrade}
                    variant="gradient"
                    size="medium"
                  />
                  <Button
                    title="Cancel Subscription"
                    onPress={handleCancelSubscription}
                    variant="outline"
                    size="medium"
                    isLoading={cancelLoading}
                  />
                </>
              )}
            </View>
          )}

          {isFree && (
            <View style={styles.planActions}>
              <Button
                title="Upgrade to Premium"
                onPress={handleUpgrade}
                variant="gradient"
                size="large"
              />
            </View>
          )}
        </Card>

        {/* Feature Usage */}
        {featureLimits && (
          <Card style={styles.featuresCard}>
            <Text style={styles.sectionTitle}>Feature Usage</Text>

            <View style={styles.featuresList}>
              {/* Portfolio Images */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <Ionicons name="images-outline" size={24} color={colors.primary.main} />
                  <Text style={styles.featureTitle}>Portfolio Images</Text>
                </View>
                <View style={styles.featureLimit}>
                  <Text style={styles.featureLimitText}>
                    {featureLimits.maxPortfolioImages === 999
                      ? 'Unlimited'
                      : `Up to ${featureLimits.maxPortfolioImages}`}
                  </Text>
                </View>
              </View>

              {/* Services */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <Ionicons name="cut-outline" size={24} color={colors.primary.main} />
                  <Text style={styles.featureTitle}>Services</Text>
                </View>
                <View style={styles.featureLimit}>
                  <Text style={styles.featureLimitText}>
                    {featureLimits.maxServices === 999
                      ? 'Unlimited'
                      : `Up to ${featureLimits.maxServices}`}
                  </Text>
                </View>
              </View>

              {/* Posts Per Day */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <Ionicons name="create-outline" size={24} color={colors.primary.main} />
                  <Text style={styles.featureTitle}>Posts Per Day</Text>
                </View>
                <View style={styles.featureLimit}>
                  <Text style={styles.featureLimitText}>
                    {featureLimits.maxPostsPerDay === 999
                      ? 'Unlimited'
                      : `Up to ${featureLimits.maxPostsPerDay}`}
                  </Text>
                </View>
              </View>

              {/* Booking Fee */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <Ionicons name="cash-outline" size={24} color={colors.primary.main} />
                  <Text style={styles.featureTitle}>Booking Fee</Text>
                </View>
                <View style={styles.featureLimit}>
                  <Text style={styles.featureLimitText}>
                    {(featureLimits.bookingFeePercentage * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Analytics */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <Ionicons
                    name="analytics-outline"
                    size={24}
                    color={
                      featureLimits.analytics ? colors.primary.main : colors.text.tertiary
                    }
                  />
                  <Text
                    style={[
                      styles.featureTitle,
                      !featureLimits.analytics && styles.disabledFeature,
                    ]}
                  >
                    Analytics Dashboard
                  </Text>
                </View>
                <View style={styles.featureLimit}>
                  {featureLimits.analytics ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
                  ) : (
                    <Ionicons name="lock-closed" size={24} color={colors.text.tertiary} />
                  )}
                </View>
              </View>

              {/* Priority Support */}
              <View style={styles.featureItem}>
                <View style={styles.featureHeader}>
                  <Ionicons
                    name="headset-outline"
                    size={24}
                    color={
                      featureLimits.prioritySupport ? colors.primary.main : colors.text.tertiary
                    }
                  />
                  <Text
                    style={[
                      styles.featureTitle,
                      !featureLimits.prioritySupport && styles.disabledFeature,
                    ]}
                  >
                    Priority Support
                  </Text>
                </View>
                <View style={styles.featureLimit}>
                  {featureLimits.prioritySupport ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
                  ) : (
                    <Ionicons name="lock-closed" size={24} color={colors.text.tertiary} />
                  )}
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Manage Subscription</Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleViewPaymentHistory}>
            <View style={styles.actionLeft}>
              <Ionicons name="receipt-outline" size={24} color={colors.text.primary} />
              <Text style={styles.actionText}>Payment History</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('PromotionPlans')}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="gift-outline" size={24} color={colors.text.primary} />
              <Text style={styles.actionText}>View All Plans</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() =>
              Alert.alert('Support', 'Contact support at support@barberconnect.com')
            }
          >
            <View style={styles.actionLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.text.primary} />
              <Text style={styles.actionText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  planCard: {
    marginBottom: spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planName: {
    ...textStyles.h2,
    fontWeight: '700',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPrice: {
    ...textStyles.h3,
    color: colors.accent.gold,
    fontWeight: '700',
  },
  planDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningRow: {},
  detailText: {
    ...textStyles.body,
    color: colors.text.secondary,
    flex: 1,
  },
  warningText: {
    color: colors.status.error,
  },
  planActions: {
    gap: spacing.sm,
  },
  featuresCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  featureTitle: {
    ...textStyles.body,
    fontWeight: '600',
  },
  disabledFeature: {
    color: colors.text.tertiary,
  },
  featureLimit: {
    alignItems: 'flex-end',
  },
  featureLimitText: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: spacing['4xl'],
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  actionText: {
    ...textStyles.body,
    fontWeight: '600',
  },
});
