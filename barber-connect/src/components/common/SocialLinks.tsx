import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SocialLinks as SocialLinksType } from '../../types/barber.types';
import { SOCIAL_PLATFORMS, getDisplayUrl, extractUsername } from '../../utils/socialLinks.utils';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../theme';

interface SocialLinksProps {
  socialLinks?: SocialLinksType;
  variant?: 'default' | 'compact' | 'icons-only';
  showLabels?: boolean;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  socialLinks,
  variant = 'default',
  showLabels = true,
}) => {
  if (!socialLinks) return null;

  const handleLinkPress = async (url: string, platform: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const renderLink = (platform: string, url: string) => {
    const platformConfig = SOCIAL_PLATFORMS[platform];
    if (!platformConfig || !url) return null;

    if (variant === 'icons-only') {
      return (
        <TouchableOpacity
          key={platform}
          style={[styles.iconButton, { borderColor: platformConfig.color + '40' }]}
          onPress={() => handleLinkPress(url, platform)}
          activeOpacity={0.7}
        >
          <Ionicons name={platformConfig.icon as any} size={24} color={platformConfig.color} />
        </TouchableOpacity>
      );
    }

    if (variant === 'compact') {
      return (
        <TouchableOpacity
          key={platform}
          style={[
            styles.compactLink,
            {
              borderColor: platformConfig.color + '40',
              backgroundColor: platformConfig.color + '10',
            },
          ]}
          onPress={() => handleLinkPress(url, platform)}
          activeOpacity={0.7}
        >
          <Ionicons name={platformConfig.icon as any} size={20} color={platformConfig.color} />
          {showLabels && (
            <Text style={[styles.compactText, { color: platformConfig.color }]}>
              {extractUsername(platform, url) || platformConfig.name}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    // Default variant
    return (
      <TouchableOpacity
        key={platform}
        style={styles.linkItem}
        onPress={() => handleLinkPress(url, platform)}
        activeOpacity={0.7}
      >
        <View style={[styles.linkIcon, { backgroundColor: platformConfig.color + '20' }]}>
          <Ionicons name={platformConfig.icon as any} size={24} color={platformConfig.color} />
        </View>
        <View style={styles.linkContent}>
          <Text style={styles.linkName}>{platformConfig.name}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {getDisplayUrl(url)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  const renderCustomLink = (link: { title: string; url: string; icon?: string }, index: number) => {
    if (variant === 'icons-only') {
      return (
        <TouchableOpacity
          key={`custom-${index}`}
          style={[styles.iconButton, { borderColor: colors.accent.gold + '40' }]}
          onPress={() => handleLinkPress(link.url, 'custom')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={(link.icon as any) || 'link-outline'}
            size={24}
            color={colors.accent.gold}
          />
        </TouchableOpacity>
      );
    }

    if (variant === 'compact') {
      return (
        <TouchableOpacity
          key={`custom-${index}`}
          style={[
            styles.compactLink,
            {
              borderColor: colors.accent.gold + '40',
              backgroundColor: colors.accent.gold + '10',
            },
          ]}
          onPress={() => handleLinkPress(link.url, 'custom')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={(link.icon as any) || 'link-outline'}
            size={20}
            color={colors.accent.gold}
          />
          {showLabels && (
            <Text style={[styles.compactText, { color: colors.accent.gold }]} numberOfLines={1}>
              {link.title}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={`custom-${index}`}
        style={styles.linkItem}
        onPress={() => handleLinkPress(link.url, 'custom')}
        activeOpacity={0.7}
      >
        <View style={[styles.linkIcon, { backgroundColor: colors.accent.gold + '20' }]}>
          <Ionicons
            name={(link.icon as any) || 'link-outline'}
            size={24}
            color={colors.accent.gold}
          />
        </View>
        <View style={styles.linkContent}>
          <Text style={styles.linkName}>{link.title}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {getDisplayUrl(link.url)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  const platforms = ['instagram', 'tiktok', 'facebook', 'youtube', 'twitter', 'linkedin', 'website', 'bookingUrl'];
  const hasAnyLinks = platforms.some(p => socialLinks[p as keyof SocialLinksType]) || (socialLinks.customLinks && socialLinks.customLinks.length > 0);

  if (!hasAnyLinks) return null;

  if (variant === 'icons-only' || variant === 'compact') {
    return (
      <View style={variant === 'icons-only' ? styles.iconsContainer : styles.compactContainer}>
        {platforms.map(platform => {
          const url = socialLinks[platform as keyof SocialLinksType] as string;
          if (url) return renderLink(platform, url);
          return null;
        })}
        {socialLinks.customLinks?.map((link, index) => renderCustomLink(link, index))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Links</Text>
      <View style={styles.linksContainer}>
        {platforms.map(platform => {
          const url = socialLinks[platform as keyof SocialLinksType] as string;
          if (url) return renderLink(platform, url);
          return null;
        })}
        {socialLinks.customLinks?.map((link, index) => renderCustomLink(link, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  linksContainer: {
    gap: spacing.sm,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  linkIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: {
    flex: 1,
  },
  linkName: {
    ...textStyles.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  linkUrl: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
  },
  compactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  compactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  compactText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    maxWidth: 120,
  },
});
