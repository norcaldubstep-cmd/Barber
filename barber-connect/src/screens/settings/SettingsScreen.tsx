import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { useAuthStore } from '../../store/authStore';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  color?: string;
}

export const SettingsScreen = ({ navigation }: any) => {
  const { signOut } = useAuthStore();

  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  // Privacy Settings
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: (item.color || colors.accent.gold) + '20' }]}>
        <Ionicons name={item.icon} size={20} color={item.color || colors.accent.gold} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
      </View>
      {item.showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  const renderToggle = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    subtitle: string,
    value: boolean,
    onChange: (value: boolean) => void,
    color: string = colors.accent.gold
  ) => (
    <View style={styles.settingItem}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border.medium, true: colors.accent.gold + '50' }}
        thumbColor={value ? colors.accent.gold : colors.background.secondary}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            {renderSettingItem({
              icon: 'person-outline',
              label: 'Edit Profile',
              subtitle: 'Update your personal information',
              onPress: () => navigation.navigate('EditProfile'),
              showArrow: true,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'lock-closed-outline',
              label: 'Change Password',
              subtitle: 'Update your password',
              onPress: () => navigation.navigate('ChangePassword'),
              showArrow: true,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'card-outline',
              label: 'Payment Methods',
              subtitle: 'Manage your cards and payment options',
              onPress: () => console.log('Payment methods'),
              showArrow: true,
            })}
          </Card>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.card}>
            {renderToggle(
              'notifications',
              'Push Notifications',
              'Receive notifications on this device',
              pushNotifications,
              setPushNotifications,
              colors.accent.blue
            )}
            <View style={styles.divider} />
            {renderToggle(
              'mail',
              'Email Notifications',
              'Receive updates via email',
              emailNotifications,
              setEmailNotifications,
              colors.accent.gold
            )}
            <View style={styles.divider} />
            {renderToggle(
              'chatbubble',
              'SMS Notifications',
              'Receive text message alerts',
              smsNotifications,
              setSmsNotifications,
              colors.success
            )}
            <View style={styles.divider} />
            {renderToggle(
              'alarm',
              'Booking Reminders',
              'Get reminded about upcoming appointments',
              bookingReminders,
              setBookingReminders,
              colors.accent.red
            )}
            <View style={styles.divider} />
            {renderToggle(
              'megaphone',
              'Promotional Emails',
              'Receive special offers and updates',
              promotionalEmails,
              setPromotionalEmails,
              colors.accent.gold
            )}
          </Card>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Card style={styles.card}>
            {renderToggle(
              'eye',
              'Show Online Status',
              'Let others see when you\'re online',
              showOnlineStatus,
              setShowOnlineStatus,
              colors.success
            )}
            <View style={styles.divider} />
            {renderToggle(
              'time',
              'Show Last Seen',
              'Display when you were last active',
              showLastSeen,
              setShowLastSeen,
              colors.text.secondary
            )}
            <View style={styles.divider} />
            {renderToggle(
              'globe',
              'Public Profile',
              'Make your profile visible to everyone',
              profileVisibility,
              setProfileVisibility,
              colors.accent.blue
            )}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'shield-checkmark-outline',
              label: 'Blocked Users',
              subtitle: 'Manage blocked accounts',
              onPress: () => console.log('Blocked users'),
              showArrow: true,
            })}
          </Card>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <Card style={styles.card}>
            {renderToggle(
              'moon',
              'Dark Mode',
              'Use dark theme for the app',
              darkMode,
              setDarkMode,
              colors.text.secondary
            )}
            <View style={styles.divider} />
            {renderToggle(
              'play-circle',
              'Auto-Play Videos',
              'Automatically play videos in feed',
              autoPlayVideos,
              setAutoPlayVideos,
              colors.accent.red
            )}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'language-outline',
              label: 'Language',
              subtitle: 'English',
              onPress: () => console.log('Language'),
              showArrow: true,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'location-outline',
              label: 'Location Services',
              subtitle: 'Always allowed',
              onPress: () => console.log('Location'),
              showArrow: true,
            })}
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.card}>
            {renderSettingItem({
              icon: 'help-circle-outline',
              label: 'Help Center',
              subtitle: 'Get help with your account',
              onPress: () => console.log('Help'),
              showArrow: true,
              color: colors.accent.blue,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'chatbubble-ellipses-outline',
              label: 'Contact Support',
              subtitle: 'Get in touch with our team',
              onPress: () => console.log('Contact'),
              showArrow: true,
              color: colors.success,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'bug-outline',
              label: 'Report a Bug',
              subtitle: 'Help us improve the app',
              onPress: () => console.log('Bug report'),
              showArrow: true,
              color: colors.accent.red,
            })}
          </Card>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Card style={styles.card}>
            {renderSettingItem({
              icon: 'document-text-outline',
              label: 'Terms of Service',
              onPress: () => console.log('Terms'),
              showArrow: true,
              color: colors.text.secondary,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'shield-checkmark-outline',
              label: 'Privacy Policy',
              onPress: () => console.log('Privacy'),
              showArrow: true,
              color: colors.text.secondary,
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: 'information-circle-outline',
              label: 'About',
              subtitle: 'Version 1.0.0',
              onPress: () => console.log('About'),
              showArrow: true,
              color: colors.text.secondary,
            })}
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
          <Card style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Sign Out</Text>
                <Text style={styles.settingSubtitle}>Sign out of your account</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
              </View>
            </TouchableOpacity>
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
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...textStyles.h3, fontWeight: '700', marginBottom: spacing.md },
  card: { padding: spacing.sm },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingText: { flex: 1 },
  settingLabel: { ...textStyles.body, fontWeight: '600', marginBottom: 2 },
  settingSubtitle: { ...textStyles.caption, color: colors.text.secondary },
  divider: { height: 1, backgroundColor: colors.border.light, marginLeft: 56 },
});
