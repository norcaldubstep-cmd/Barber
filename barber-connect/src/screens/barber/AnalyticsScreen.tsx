import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

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

const MOCK_DATA: Record<TimePeriod, AnalyticsData> = {
  week: {
    revenue: 2450,
    bookings: 38,
    newClients: 7,
    profileViews: 142,
    revenueChange: 12.5,
    bookingsChange: 8.3,
    topServices: [
      { name: 'Premium Fade', count: 15, revenue: 975 },
      { name: 'Haircut & Beard', count: 12, revenue: 1020 },
      { name: 'Classic Cut', count: 11, revenue: 455 },
    ],
    revenueByDay: [
      { day: 'Mon', amount: 325 },
      { day: 'Tue', amount: 420 },
      { day: 'Wed', amount: 380 },
      { day: 'Thu', amount: 455 },
      { day: 'Fri', amount: 510 },
      { day: 'Sat', amount: 360 },
      { day: 'Sun', amount: 0 },
    ],
  },
  month: {
    revenue: 9800,
    bookings: 152,
    newClients: 28,
    profileViews: 567,
    revenueChange: 15.2,
    bookingsChange: 11.7,
    topServices: [
      { name: 'Premium Fade', count: 62, revenue: 4030 },
      { name: 'Haircut & Beard', count: 48, revenue: 4080 },
      { name: 'Classic Cut', count: 42, revenue: 1890 },
    ],
    revenueByDay: [
      { day: 'W1', amount: 2100 },
      { day: 'W2', amount: 2450 },
      { day: 'W3', amount: 2680 },
      { day: 'W4', amount: 2570 },
    ],
  },
  year: {
    revenue: 112500,
    bookings: 1824,
    newClients: 342,
    profileViews: 6842,
    revenueChange: 22.8,
    bookingsChange: 18.5,
    topServices: [
      { name: 'Premium Fade', count: 742, revenue: 48230 },
      { name: 'Haircut & Beard', count: 578, revenue: 49130 },
      { name: 'Classic Cut', count: 504, revenue: 22680 },
    ],
    revenueByDay: [
      { day: 'Jan', amount: 7800 },
      { day: 'Feb', amount: 8200 },
      { day: 'Mar', amount: 9100 },
      { day: 'Apr', amount: 9400 },
      { day: 'May', amount: 10200 },
      { day: 'Jun', amount: 10800 },
      { day: 'Jul', amount: 11200 },
      { day: 'Aug', amount: 10900 },
      { day: 'Sep', amount: 9800 },
      { day: 'Oct', amount: 8900 },
      { day: 'Nov', amount: 8100 },
      { day: 'Dec', amount: 8100 },
    ],
  },
};

export const AnalyticsScreen = ({ navigation }: any) => {
  const [period, setPeriod] = useState<TimePeriod>('month');
  const data = MOCK_DATA[period];

  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.amount));

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
                      colors={['#D4AF37', '#FFD700']}
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
