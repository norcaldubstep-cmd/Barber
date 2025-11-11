import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
}

interface ToggleSettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const isBarber = user?.role === UserRole.BARBER;
  const isBusinessOwner = user?.isBusinessOwner;

  const accountSettings: SettingsItem[] = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      value: 'Update your personal information',
      onPress: () => navigation.navigate('EditProfile'),
      showArrow: true,
    },
    {
      icon: 'lock-closed-outline',
      label: 'Change Password',
      value: 'Update your password',
      onPress: () => navigation.navigate('ChangePassword'),
      showArrow: true,
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      value: 'Manage your cards',
      onPress: () => navigation.navigate('Settings'),
      showArrow: true,
    },
  ];

  const barberSettings: SettingsItem[] = [
    {
      icon: 'calendar-outline',
      label: 'Manage Schedule',
      value: 'Set your availability',
      onPress: () => navigation.navigate('ScheduleEditor'),
      showArrow: true,
    },
    {
      icon: 'briefcase-outline',
      label: 'My Services',
      value: 'Edit services & pricing',
      onPress: () => navigation.navigate('MyServices'),
      showArrow: true,
    },
    {
      icon: 'images-outline',
      label: 'Portfolio',
      value: 'Manage your work',
      onPress: () => navigation.navigate('Portfolio'),
      showArrow: true,
    },
    {
      icon: 'star-outline',
      label: 'Promotion Plan',
      value: 'Upgrade to get featured',
      onPress: () => navigation.navigate('PromotionPlans'),
      showArrow: true,
      color: colors.accent.gold,
    },
  ];

  const businessSettings: SettingsItem[] = [
    {
      icon: 'business-outline',
      label: 'Manage Business',
      value: 'Business details & settings',
      onPress: () => console.log('Manage business'),
      showArrow: true,
    },
    {
      icon: 'people-outline',
      label: 'Team Members',
      value: 'Manage your barbers',
      onPress: () => console.log('Team'),
      showArrow: true,
    },
    {
      icon: 'megaphone-outline',
      label: 'Post a Job',
      value: 'Hire new talent',
      onPress: () => navigation.navigate('JobBoard'),
      showArrow: true,
    },
  ];

  const notificationSettings: ToggleSettingsItem[] = [
    {
      icon: 'notifications-outline',
      label: 'Push Notifications',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      icon: 'location-outline',
      label: 'Location Services',
      value: locationEnabled,
      onToggle: setLocationEnabled,
    },
    {
      icon: 'mail-outline',
      label: 'Marketing Emails',
      value: marketingEnabled,
      onToggle: setMarketingEnabled,
    },
  ];

  const appSettings: SettingsItem[] = [
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      value: 'Get help with your account',
      onPress: () => console.log('Help'),
      showArrow: true,
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Conditions',
      value: '',
      onPress: () => console.log('Terms'),
      showArrow: true,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      value: '',
      onPress: () => console.log('Privacy'),
      showArrow: true,
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      value: 'Version 1.0.0',
      onPress: () => console.log('About'),
      showArrow: true,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const stats = [
    { label: 'Posts', value: isBarber ? '48' : '12' },
    { label: 'Followers', value: isBarber ? '2.4K' : '156' },
    { label: 'Following', value: isBarber ? '189' : '234' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#D4AF37', '#FFD700', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar
              name={`${user?.firstName} ${user?.lastName}`}
              size="2xl"
              verified={isBarber}
              showGradientBorder={isBarber}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <LinearGradient
                colors={['#D4AF37', '#FFD700']}
                style={styles.editAvatarGradient}
              >
                <Ionicons name="camera" size={16} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {isBarber && (
            <View style={styles.roleBadge}>
              <Ionicons name="cut" size={16} color={colors.accent.gold} />
              <Text style={styles.roleText}>Professional Barber</Text>
            </View>
          )}

          {isBusinessOwner && (
            <View style={[styles.roleBadge, styles.businessBadge]}>
              <Ionicons name="business" size={16} color={colors.accent.red} />
              <Text style={[styles.roleText, { color: colors.accent.red }]}>
                Business Owner
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <TouchableOpacity style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </TouchableOpacity>
                {index < stats.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="View My Profile"
              onPress={() => navigation.navigate('UserProfileView', { userId: user?.id, isOwnProfile: true })}
              variant="gradient"
              size="medium"
              icon="person-outline"
              style={styles.editButton}
            />
            <Button
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
              variant="outline"
              size="medium"
              icon="create-outline"
              style={styles.viewButton}
            />
          </View>
        </View>

        {/* Quick Actions */}
        {!isBarber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Card style={styles.quickActionsCard}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Bookings')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                  <Ionicons name="calendar" size={24} color={colors.accent.blue} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>My Bookings</Text>
                  <Text style={styles.quickActionSubtitle}>View appointments</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <View style={styles.quickActionDivider} />

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Favorites')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.accent.gold + '20' }]}>
                  <Ionicons name="heart" size={24} color={colors.accent.gold} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>Favorites</Text>
                  <Text style={styles.quickActionSubtitle}>Saved barbers</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Barber Dashboard */}
        {isBarber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Barber Dashboard</Text>
            <Card style={styles.dashboardCard}>
              <View style={styles.dashboardRow}>
                <View style={styles.dashboardStat}>
                  <Ionicons name="calendar" size={20} color={colors.accent.gold} />
                  <Text style={styles.dashboardValue}>12</Text>
                  <Text style={styles.dashboardLabel}>Upcoming</Text>
                </View>
                <View style={styles.dashboardStat}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.dashboardValue}>48</Text>
                  <Text style={styles.dashboardLabel}>This Month</Text>
                </View>
                <View style={styles.dashboardStat}>
                  <Ionicons name="cash" size={20} color={colors.accent.blue} />
                  <Text style={styles.dashboardValue}>$2.4K</Text>
                  <Text style={styles.dashboardLabel}>Revenue</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.settingsCard}>
            {accountSettings.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <View style={styles.settingDivider} />}
                <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
                  <View style={[styles.settingIcon, { backgroundColor: (item.color || colors.accent.gold) + '20' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color || colors.accent.gold} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                  </View>
                  {item.showArrow && (
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Barber Settings */}
        {isBarber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Barber Tools</Text>
            <Card style={styles.settingsCard}>
              {barberSettings.map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 && <View style={styles.settingDivider} />}
                  <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
                    <View style={[styles.settingIcon, { backgroundColor: (item.color || colors.accent.gold) + '20' }]}>
                      <Ionicons name={item.icon} size={20} color={item.color || colors.accent.gold} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                    </View>
                    {item.showArrow && (
                      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </Card>
          </View>
        )}

        {/* Business Settings */}
        {isBusinessOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Management</Text>
            <Card style={styles.settingsCard}>
              {businessSettings.map((item, index) => (
                <React.Fragment key={item.label}>
                  {index > 0 && <View style={styles.settingDivider} />}
                  <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.accent.red + '20' }]}>
                      <Ionicons name={item.icon} size={20} color={colors.accent.red} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                    </View>
                    {item.showArrow && (
                      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </Card>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.settingsCard}>
            {notificationSettings.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <View style={styles.settingDivider} />}
                <View style={styles.settingItem}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent.blue + '20' }]}>
                    <Ionicons name={item.icon} size={20} color={colors.accent.blue} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border.medium, true: colors.accent.gold + '50' }}
                    thumbColor={item.value ? colors.accent.gold : colors.background.secondary}
                  />
                </View>
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <Card style={styles.settingsCard}>
            {appSettings.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <View style={styles.settingDivider} />}
                <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.text.secondary + '20' }]}>
                    <Ionicons name={item.icon} size={20} color={colors.text.secondary} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                  </View>
                  {item.showArrow && (
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            size="large"
            fullWidth
            icon="log-out-outline"
          />
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  headerGradient: { height: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: { alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: -40 },
  avatarContainer: { position: 'relative', marginBottom: spacing.md },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  userName: { ...textStyles.h2, fontWeight: '700', marginBottom: spacing.xs },
  userEmail: { ...textStyles.body, color: colors.text.secondary, marginBottom: spacing.md },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  businessBadge: { backgroundColor: colors.accent.red + '20' },
  roleText: { ...textStyles.caption, color: colors.accent.gold, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.xs },
  statLabel: { ...textStyles.caption, color: colors.text.secondary },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border.light },
  actionButtons: { flexDirection: 'row', gap: spacing.sm, width: '100%', marginBottom: spacing.xl },
  editButton: { flex: 1 },
  viewButton: { flex: 1 },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  quickActionsCard: { padding: spacing.md },
  quickAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  quickActionText: { flex: 1 },
  quickActionTitle: { ...textStyles.body, fontWeight: '600', marginBottom: 2 },
  quickActionSubtitle: { ...textStyles.caption, color: colors.text.secondary },
  quickActionDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  dashboardCard: { padding: spacing.lg },
  dashboardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  dashboardStat: { alignItems: 'center', gap: spacing.xs },
  dashboardValue: { ...textStyles.h2, fontWeight: '700', marginTop: spacing.xs },
  dashboardLabel: { ...textStyles.caption, color: colors.text.secondary },
  settingsCard: { padding: spacing.sm },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingText: { flex: 1 },
  settingLabel: { ...textStyles.body, fontWeight: '600', marginBottom: 2 },
  settingValue: { ...textStyles.caption, color: colors.text.secondary },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 56,
  },
});
