import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import {
  getJobListings,
  submitJobApplication,
  getUserApplications,
} from '../../services/jobsService';
import { JobListing, JobType, JobStatus, JobApplication } from '../../types/job.types';

export const JobBoardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | JobType>('all');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const jobTypeLabels: Record<JobType, string> = {
    [JobType.FULL_TIME]: 'Full Time',
    [JobType.PART_TIME]: 'Part Time',
    [JobType.CONTRACT]: 'Contract',
    [JobType.FREELANCE]: 'Freelance',
    [JobType.BOOTH_RENTAL]: 'Booth Rental',
  };

  const filters: Array<{ key: 'all' | JobType; label: string }> = [
    { key: 'all', label: 'All Jobs' },
    { key: JobType.FULL_TIME, label: 'Full Time' },
    { key: JobType.PART_TIME, label: 'Part Time' },
    { key: JobType.CONTRACT, label: 'Contract' },
    { key: JobType.BOOTH_RENTAL, label: 'Booth Rental' },
  ];

  // Load jobs and user applications
  useEffect(() => {
    loadJobs();
    if (user?.id) {
      loadUserApplications();
    }
  }, [selectedFilter, user?.id]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const filters = selectedFilter === 'all'
        ? { status: JobStatus.OPEN }
        : { type: selectedFilter, status: JobStatus.OPEN };
      const jobListings = await getJobListings(filters, 50);
      setJobs(jobListings);
    } catch (error) {
      console.error('Error loading jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserApplications = async () => {
    if (!user?.id) return;
    try {
      const applications = await getUserApplications(user.id);
      setUserApplications(applications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadJobs();
    loadUserApplications();
  };

  const handleApplyToJob = async (job: JobListing) => {
    if (!user?.id || !user.email) {
      Alert.alert('Error', 'You must be logged in to apply');
      return;
    }

    // Check if already applied
    const alreadyApplied = userApplications.some(app => app.jobId === job.id);
    if (alreadyApplied) {
      Alert.alert('Already Applied', 'You have already applied to this job');
      return;
    }

    Alert.alert(
      'Apply to Job',
      `Apply for ${job.title} at ${job.businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              await submitJobApplication(
                job.id,
                job.title,
                user.id,
                user.name || 'Anonymous',
                user.email,
                job.employerId,
                {
                  applicantAvatar: user.profileImage,
                  phoneNumber: user.phone,
                }
              );
              Alert.alert('Success', 'Your application has been submitted!');
              loadUserApplications();
            } catch (error) {
              console.error('Error applying to job:', error);
              Alert.alert('Error', 'Failed to submit application');
            }
          },
        },
      ]
    );
  };

  const hasApplied = (jobId: string): boolean => {
    return userApplications.some(app => app.jobId === jobId);
  };

  const formatSalary = (job: JobListing): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });

    if (job.type === JobType.BOOTH_RENTAL && job.boothRentalCost) {
      return `${formatter.format(job.boothRentalCost)}/month`;
    }

    if (!job.salaryMin || !job.salaryMax) {
      return 'Salary negotiable';
    }

    const suffix = job.salaryType === 'hourly' ? '/hr'
      : job.salaryType === 'weekly' ? '/wk'
      : job.salaryType === 'monthly' ? '/mo'
      : job.salaryType === 'yearly' ? '/yr'
      : '';

    return `${formatter.format(job.salaryMin)}-${formatter.format(job.salaryMax)}${suffix}`;
  };

  const formatPostedTime = (dateString: string): string => {
    const date = new Date(dateString);
    const diffInDays = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const renderJob = ({ item }: { item: JobListing }) => {
    const applied = hasApplied(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
      >
        <Card style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Avatar
              name={item.businessName}
              imageUrl={item.employerAvatar}
              size="lg"
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
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => handleApplyToJob(item)}
              disabled={applied}
            >
              {applied ? (
                <View style={styles.appliedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              ) : (
                <Ionicons name="add-circle-outline" size={24} color={colors.accent.gold} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.jobTitle}>{item.title}</Text>

          <View style={styles.jobMetaRow}>
            <View style={styles.jobMetaTag}>
              <Ionicons name="briefcase-outline" size={14} color={colors.accent.gold} />
              <Text style={styles.jobMetaText}>{jobTypeLabels[item.type]}</Text>
            </View>
            {item.yearsExperienceRequired && (
              <View style={styles.jobMetaTag}>
                <Ionicons name="bar-chart-outline" size={14} color={colors.accent.blue} />
                <Text style={styles.jobMetaText}>
                  {item.yearsExperienceRequired}+ years exp
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.jobDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.jobFooter}>
            <View style={styles.salaryContainer}>
              <Text style={styles.salaryLabel}>
                {item.type === JobType.BOOTH_RENTAL ? 'Booth Rental' : 'Salary'}
              </Text>
              <Text style={styles.salaryValue}>{formatSalary(item)}</Text>
            </View>
            <View style={styles.jobFooterRight}>
              <Text style={styles.postedTime}>{formatPostedTime(item.createdAt)}</Text>
              <View style={styles.applicantsContainer}>
                <Ionicons name="people" size={14} color={colors.text.secondary} />
                <Text style={styles.applicantsText}>{item.applicationCount} applicants</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Board</Text>
        <TouchableOpacity
          style={styles.postJobButton}
          onPress={() => navigation.navigate('PostJob')}
        >
          <Ionicons name="add-circle" size={28} color={colors.accent.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent.gold}
            colors={[colors.accent.gold]}
          />
        }
      >
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.gold} />
          </View>
        ) : (
          <>
            {/* Stats Banner */}
            <Card style={styles.statsBanner}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{jobs.length}</Text>
                  <Text style={styles.statLabel}>Open Positions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {jobs.reduce((sum, job) => sum + job.applicationCount, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total Applicants</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userApplications.length}</Text>
                  <Text style={styles.statLabel}>Your Applications</Text>
                </View>
              </View>
            </Card>

            {/* Jobs List */}
            {jobs.length > 0 ? (
              <View style={styles.jobsSection}>
                <Text style={styles.sectionTitle}>
                  {selectedFilter === 'all' ? 'All Jobs' : jobTypeLabels[selectedFilter]}
                </Text>
                {jobs.map((job) => (
                  <View key={job.id}>{renderJob({ item: job })}</View>
                ))}
              </View>
            ) : (
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
          </>
        )}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Post Job FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PostJob')}
        activeOpacity={0.9}
      >
        <LinearGradient colors={['#D4AF37', '#E8C869']} style={styles.fabGradient}>
          <Ionicons name="add" size={32} color="#000" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
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
  applyButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appliedBadge: { alignItems: 'center', justifyContent: 'center' },
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
