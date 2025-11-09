import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';

type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'APPRENTICESHIP';
type ExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';

interface Job {
  id: string;
  businessName: string;
  businessLogo?: string;
  isVerified: boolean;
  title: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  location: {
    city: string;
    state: string;
  };
  salary: {
    min: number;
    max: number;
    type: 'hourly' | 'yearly' | 'commission';
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: Date;
  applicants: number;
  isFeatured?: boolean;
}

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    businessName: 'Elite Cuts Studio',
    isVerified: true,
    title: 'Senior Barber - Full Time',
    type: 'FULL_TIME',
    experienceLevel: 'EXPERT',
    location: { city: 'San Francisco', state: 'CA' },
    salary: { min: 60000, max: 85000, type: 'yearly' },
    description:
      'We are looking for an experienced barber to join our elite team. You will work with high-end clientele and have access to premium products and tools.',
    requirements: [
      '5+ years of professional experience',
      'Expert in fades and modern cuts',
      'Strong client communication skills',
      'Valid barbering license',
    ],
    benefits: [
      'Health insurance',
      'Paid time off',
      'Commission on products',
      'Continuing education',
    ],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    applicants: 12,
    isFeatured: true,
  },
  {
    id: '2',
    businessName: 'Fresh Fade Barbershop',
    isVerified: true,
    title: 'Barber Apprenticeship Program',
    type: 'APPRENTICESHIP',
    experienceLevel: 'ENTRY',
    location: { city: 'Los Angeles', state: 'CA' },
    salary: { min: 18, max: 25, type: 'hourly' },
    description:
      'Join our renowned apprenticeship program and learn from master barbers. Perfect for those starting their barbering journey.',
    requirements: [
      'Passion for barbering',
      'Willingness to learn',
      'Good attitude and work ethic',
      'Basic knowledge preferred',
    ],
    benefits: [
      'Hands-on training',
      'Mentorship program',
      'Flexible schedule',
      'Tool discounts',
    ],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    applicants: 28,
  },
  {
    id: '3',
    businessName: 'Downtown Barber Co.',
    isVerified: false,
    title: 'Weekend Barber',
    type: 'PART_TIME',
    experienceLevel: 'INTERMEDIATE',
    location: { city: 'San Diego', state: 'CA' },
    salary: { min: 25, max: 40, type: 'hourly' },
    description:
      'Seeking a skilled barber for weekend coverage. Great for those looking for flexible part-time work.',
    requirements: [
      '2+ years of experience',
      'Available Saturdays and Sundays',
      'Professional demeanor',
      'Valid license',
    ],
    benefits: ['Competitive hourly rate', 'Tips', 'Flexible hours'],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    applicants: 8,
  },
];

export const JobBoardScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | JobType>('all');
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const jobTypeLabels: Record<JobType, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    APPRENTICESHIP: 'Apprenticeship',
  };

  const experienceLevelLabels: Record<ExperienceLevel, string> = {
    ENTRY: 'Entry Level',
    INTERMEDIATE: 'Intermediate',
    EXPERT: 'Expert',
  };

  const filters: Array<{ key: 'all' | JobType; label: string }> = [
    { key: 'all', label: 'All Jobs' },
    { key: 'FULL_TIME', label: 'Full Time' },
    { key: 'PART_TIME', label: 'Part Time' },
    { key: 'APPRENTICESHIP', label: 'Apprentice' },
  ];

  const formatSalary = (salary: Job['salary']): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });

    if (salary.type === 'hourly') {
      return `${formatter.format(salary.min)}-${formatter.format(salary.max)}/hr`;
    } else if (salary.type === 'yearly') {
      return `${formatter.format(salary.min)}-${formatter.format(salary.max)}/yr`;
    } else {
      return 'Commission-based';
    }
  };

  const formatPostedTime = (date: Date): string => {
    const diffInDays = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const filteredJobs =
    selectedFilter === 'all'
      ? jobs
      : jobs.filter((job) => job.type === selectedFilter);

  const renderJob = ({ item }: { item: Job }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
    >
      <Card style={[styles.jobCard, item.isFeatured && styles.featuredJobCard]}>
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.featuredGradient}>
              <Ionicons name="star" size={12} color="#000" />
              <Text style={styles.featuredText}>FEATURED</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.jobHeader}>
          <Avatar
            name={item.businessName}
            size="lg"
            verified={item.isVerified}
            showGradientBorder={item.isFeatured}
          />
          <View style={styles.jobHeaderText}>
            <Text style={styles.businessName} numberOfLines={1}>
              {item.businessName}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.text.secondary} />
              <Text style={styles.locationText}>
                {item.location.city}, {item.location.state}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.saveButton}>
            <Ionicons name="bookmark-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.jobTitle}>{item.title}</Text>

        <View style={styles.jobMetaRow}>
          <View style={styles.jobMetaTag}>
            <Ionicons name="briefcase-outline" size={14} color={colors.accent.gold} />
            <Text style={styles.jobMetaText}>{jobTypeLabels[item.type]}</Text>
          </View>
          <View style={styles.jobMetaTag}>
            <Ionicons name="bar-chart-outline" size={14} color={colors.accent.blue} />
            <Text style={styles.jobMetaText}>
              {experienceLevelLabels[item.experienceLevel]}
            </Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.salaryContainer}>
            <Text style={styles.salaryLabel}>Salary</Text>
            <Text style={styles.salaryValue}>{formatSalary(item.salary)}</Text>
          </View>
          <View style={styles.jobFooterRight}>
            <Text style={styles.postedTime}>{formatPostedTime(item.postedAt)}</Text>
            <View style={styles.applicantsContainer}>
              <Ionicons name="people" size={14} color={colors.text.secondary} />
              <Text style={styles.applicantsText}>{item.applicants} applicants</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Board</Text>
        <TouchableOpacity style={styles.postJobButton}>
          <Ionicons name="add-circle" size={28} color={colors.accent.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    selectedFilter === filter.key
                      ? ['#D4AF37', '#FFD700']
                      : [colors.background.secondary, colors.background.secondary]
                  }
                  style={styles.filterChip}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter.key && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Banner */}
        <Card style={styles.statsBanner}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{filteredJobs.length}</Text>
              <Text style={styles.statLabel}>Open Positions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {filteredJobs.reduce((sum, job) => sum + job.applicants, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Applicants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {filteredJobs.filter((j) => j.isFeatured).length}
              </Text>
              <Text style={styles.statLabel}>Featured Jobs</Text>
            </View>
          </View>
        </Card>

        {/* Jobs List */}
        <View style={styles.jobsSection}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Jobs' : jobTypeLabels[selectedFilter]}
          </Text>
          {filteredJobs.map((job) => (
            <View key={job.id}>{renderJob({ item: job })}</View>
          ))}
        </View>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="briefcase-outline" size={64} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        )}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Post Job FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PostJob')}
        activeOpacity={0.9}
      >
        <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.fabGradient}>
          <Ionicons name="add" size={32} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
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
  headerTitle: { ...textStyles.h2, fontWeight: '700', flex: 1, textAlign: 'center' },
  postJobButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filtersSection: { paddingVertical: spacing.md },
  filtersContainer: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    minWidth: 100,
    alignItems: 'center',
  },
  filterText: { ...textStyles.bodySmall, fontWeight: '600', color: colors.text.primary },
  filterTextActive: { color: '#000', fontWeight: '700' },
  statsBanner: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, padding: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { ...textStyles.h3, fontWeight: '700', color: colors.accent.gold },
  statLabel: { ...textStyles.caption, color: colors.text.secondary, marginTop: spacing.xs },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border.light },
  jobsSection: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  jobCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  featuredJobCard: {
    borderColor: colors.accent.gold + '50',
    backgroundColor: colors.accent.gold + '05',
  },
  featuredBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  featuredGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  featuredText: { fontSize: 10, fontWeight: '900', color: '#000' },
  jobHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  jobHeaderText: { flex: 1, marginLeft: spacing.md },
  businessName: { ...textStyles.body, fontWeight: '700', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...textStyles.caption, color: colors.text.secondary },
  saveButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  jobTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.sm },
  jobMetaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  jobMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  jobMetaText: { ...textStyles.caption, color: colors.text.primary, fontWeight: '600' },
  jobDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
  },
  salaryContainer: {},
  salaryLabel: { ...textStyles.caption, color: colors.text.secondary, marginBottom: 2 },
  salaryValue: { ...textStyles.body, fontWeight: '700', color: colors.accent.gold },
  jobFooterRight: { alignItems: 'flex-end', gap: spacing.xs },
  postedTime: { ...textStyles.caption, color: colors.text.secondary },
  applicantsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  applicantsText: { ...textStyles.caption, color: colors.text.secondary },
  emptyState: { alignItems: 'center', padding: spacing['3xl'] },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.sm },
  emptySubtitle: { ...textStyles.body, color: colors.text.secondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    ...shadows.large,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
