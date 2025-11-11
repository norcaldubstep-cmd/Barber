import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { getBarberAnalytics } from '../../services/barberService';

const { width } = Dimensions.get('window');

type TimePeriod = 'week' | 'month' | 'year';

interface AnalyticsData {
  revenue: number;
  bookings: number;
  newClients: number;
  profileViews: number;
  revenueChange: number;
  bookingsChange: number;
  topServices: Array<{ name: string; count: number; revenue: number }>;
  revenueByDay: Array<{ day: string; amount: number }>;
}

const getDateRange = (period: TimePeriod): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};

const formatRevenueData = (rawData: any[], period: TimePeriod) => {
  if (period === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap: Record<string, number> = {};

    rawData.forEach((item) => {
      const date = new Date(item.day);
      const dayName = days[date.getDay()];
      dayMap[dayName] = (dayMap[dayName] || 0) + item.amount;
    });

    return days.map((day) => ({ day, amount: dayMap[day] || 0 }));
  } else if (period === 'month') {
    const weeks: Record<string, number> = { W1: 0, W2: 0, W3: 0, W4: 0 };

    rawData.forEach((item) => {
      const date = new Date(item.day);
      const dayOfMonth = date.getDate();
      const weekNum = Math.ceil(dayOfMonth / 7);
      weeks[`W${weekNum}`] = (weeks[`W${weekNum}`] || 0) + item.amount;
    });

    return Object.entries(weeks).map(([day, amount]) => ({ day, amount }));
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap: Record<string, number> = {};

    rawData.forEach((item) => {
      const date = new Date(item.day);
      const monthName = months[date.getMonth()];
      monthMap[monthName] = (monthMap[monthName] || 0) + item.amount;
    });

    return months.map((month) => ({ day: month, amount: monthMap[month] || 0 }));
  }
};

export const AnalyticsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(period);
      const analyticsData = await getBarberAnalytics(user.id, startDate, endDate);

      const formattedRevenue = formatRevenueData(analyticsData.revenueByDay, period);

      setData({
        revenue: analyticsData.revenue,
        bookings: analyticsData.bookings,
        newClients: analyticsData.newClients,
        profileViews: analyticsData.profileViews,
        revenueChange: analyticsData.revenueChange,
        bookingsChange: analyticsData.bookingsChange,
        topServices: analyticsData.topServices,
        revenueByDay: formattedRevenue,
      });
    } catch (err) {
      console.error('Load analytics error:', err);
      setError('Failed to load analytics');
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.gold} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.errorText}>No analytics data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.amount), 1);

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: string,
    change?: number,
    color: string = colors.accent.gold
  ) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {change !== undefined && (
        <View style={styles.changeRow}>
          <Ionicons
            name={change >= 0 ? 'trending-up' : 'trending-down'}
            size={14}
            color={change >= 0 ? colors.success : colors.error}
          />
          <Text
            style={[
              styles.changeText,
              { color: change >= 0 ? colors.success : colors.error },
            ]}
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </Text>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  period === p
                    ? ['#D4AF37', '#FFD700']
                    : [colors.background.secondary, colors.background.secondary]
                }
                style={styles.periodButton}
              >
                <Text
                  style={[styles.periodText, period === p && styles.periodTextActive]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            'cash',
            'Revenue',
            `$${data.revenue.toLocaleString()}`,
            data.revenueChange,
            colors.accent.gold
          )}
          {renderStatCard(
            'calendar',
            'Bookings',
            data.bookings.toString(),
            data.bookingsChange,
            colors.accent.blue
          )}
          {renderStatCard(
            'people',
            'New Clients',
            data.newClients.toString(),
            undefined,
            colors.success
          )}
          {renderStatCard(
            'eye',
            'Profile Views',
            data.profileViews.toString(),
            undefined,
            colors.accent.red
          )}
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <Card style={styles.chartCard}>
            <View style={styles.chart}>
              {data.revenueByDay.map((item, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <LinearGradient
                      colors={['#D4AF37', '#E8C869']}
                      style={[
                        styles.bar,
                        {
                          height: `${(item.amount / maxRevenue) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                  <Text style={styles.barValue}>${(item.amount / 1000).toFixed(1)}k</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Top Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Services</Text>
          <Card style={styles.servicesCard}>
            {data.topServices.map((service, index) => (
              <View key={service.name} style={styles.serviceRow}>
                <View style={styles.serviceRank}>
                  <LinearGradient
                    colors={
                      index === 0
                        ? ['#D4AF37', '#FFD700']
                        : index === 1
                        ? ['#C0C0C0', '#E8E8E8']
                        : ['#CD7F32', '#E6A67E']
                    }
                    style={styles.rankBadge}
                  >
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCount}>{service.count} bookings</Text>
                </View>
                <View style={styles.serviceRevenue}>
                  <Text style={styles.revenueAmount}>${service.revenue}</Text>
                  <View style={styles.revenueBar}>
                    <View
                      style={[
                        styles.revenueBarFill,
                        {
                          width: `${
                            (service.revenue /
                              Math.max(...data.topServices.map((s) => s.revenue))) *
                            100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <Card style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Ionicons name="bulb" size={20} color={colors.accent.gold} />
              <Text style={styles.insightText}>
                Your revenue is up {data.revenueChange.toFixed(1)}% compared to last{' '}
                {period}. Keep it up!
              </Text>
            </View>
          </Card>
          <Card style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Ionicons name="trending-up" size={20} color={colors.success} />
              <Text style={styles.insightText}>
                {data.topServices[0].name} is your most popular service with {data.topServices[0].count} bookings
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
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
  errorText: {
    ...textStyles.h3,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  periodText: { ...textStyles.body, fontWeight: '600', color: colors.text.primary },
  periodTextActive: { color: '#000', fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statLabel: { ...textStyles.caption, color: colors.text.secondary, marginBottom: spacing.xs },
  statValue: { ...textStyles.h2, fontWeight: '700', marginBottom: spacing.xs },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  changeText: { ...textStyles.caption, fontWeight: '700' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  chartCard: { padding: spacing.lg },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 200 },
  chartBar: { flex: 1, alignItems: 'center' },
  barContainer: { flex: 1, width: '80%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: borderRadius.sm, borderTopRightRadius: borderRadius.sm },
  barLabel: { ...textStyles.caption, color: colors.text.secondary, marginTop: spacing.xs },
  barValue: { ...textStyles.caption, fontWeight: '600', fontSize: 10 },
  servicesCard: { padding: spacing.lg, gap: spacing.lg },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  serviceRank: {},
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { ...textStyles.body, fontWeight: '900', color: '#000' },
  serviceInfo: { flex: 1 },
  serviceName: { ...textStyles.body, fontWeight: '700', marginBottom: 2 },
  serviceCount: { ...textStyles.caption, color: colors.text.secondary },
  serviceRevenue: { alignItems: 'flex-end', minWidth: 80 },
  revenueAmount: { ...textStyles.body, fontWeight: '700', color: colors.accent.gold, marginBottom: spacing.xs },
  revenueBar: {
    width: 80,
    height: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  revenueBarFill: { height: '100%', backgroundColor: colors.accent.gold },
  insightCard: { padding: spacing.md, marginBottom: spacing.sm },
  insightRow: { flexDirection: 'row', gap: spacing.sm },
  insightText: { ...textStyles.bodySmall, color: colors.text.primary, flex: 1, lineHeight: 20 },
});
