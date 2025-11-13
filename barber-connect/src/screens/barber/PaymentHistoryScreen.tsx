import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { PaymentHistory } from '../../types/payment.types';
import { getPaymentHistory } from '../../services/paymentService';
import { PROMOTION_PLANS } from '../../types/promotion.types';

export const PaymentHistoryScreen = () => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const history = await getPaymentHistory(50);
      setPayments(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'pending':
        return 'time';
      case 'refunded':
        return 'arrow-back-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return colors.status.success;
      case 'failed':
        return colors.status.error;
      case 'pending':
        return colors.status.warning;
      case 'refunded':
        return colors.text.secondary;
      default:
        return colors.text.tertiary;
    }
  };

  const renderPaymentItem = ({ item }: { item: PaymentHistory }) => {
    const plan = PROMOTION_PLANS.find((p) => p.tier === item.tier);

    return (
      <Card style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentLeft}>
            <View style={[styles.iconContainer, { backgroundColor: plan?.color + '20' }]}>
              <Ionicons name={plan?.icon as any} size={24} color={plan?.color} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>{plan?.name} Plan</Text>
              <Text style={styles.paymentDate}>
                {item.paidAt
                  ? new Date(item.paidAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </Text>
            </View>
          </View>

          <View style={styles.paymentRight}>
            <Text style={styles.paymentAmount}>
              ${(item.amount / 100).toFixed(2)}
            </Text>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(item.status)}
                size={16}
                color={getStatusColor(item.status)}
              />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <Text style={styles.paymentDescription}>{item.description}</Text>
          <View style={styles.billingCycleContainer}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.billingCycleText}>
              {item.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No Payment History</Text>
            <Text style={styles.emptyText}>
              Your payment transactions will appear here once you subscribe to a plan.
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  paymentCard: {
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    ...textStyles.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  paymentDate: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    ...textStyles.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  paymentDetails: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  paymentDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  billingCycleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  billingCycleText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyTitle: {
    ...textStyles.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },
});
