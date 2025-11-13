import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { SocialLinks as SocialLinksType, SocialLink } from '../../types/barber.types';
import {
  SOCIAL_PLATFORMS,
  validateSocialUrl,
  formatSocialUrl,
} from '../../utils/socialLinks.utils';
import { colors, spacing, borderRadius, textStyles } from '../../theme';

interface EditSocialLinksProps {
  socialLinks?: SocialLinksType;
  onChange: (socialLinks: SocialLinksType) => void;
}

export const EditSocialLinks: React.FC<EditSocialLinksProps> = ({
  socialLinks = {},
  onChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const platforms = ['instagram', 'tiktok', 'facebook', 'youtube', 'twitter', 'linkedin', 'website', 'bookingUrl'];

  const handleLinkChange = (platform: string, value: string) => {
    // Clear error for this platform
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[platform];
      return newErrors;
    });

    // Update the link
    onChange({
      ...socialLinks,
      [platform]: value.trim(),
    });
  };

  const handleLinkBlur = (platform: string) => {
    const value = socialLinks[platform as keyof SocialLinksType] as string;
    if (!value) return;

    // Validate URL
    if (!validateSocialUrl(platform, value)) {
      setErrors(prev => ({
        ...prev,
        [platform]: 'Invalid URL format',
      }));
      return;
    }

    // Format URL
    const formatted = formatSocialUrl(platform, value);
    if (formatted !== value) {
      onChange({
        ...socialLinks,
        [platform]: formatted,
      });
    }
  };

  const handleAddCustomLink = () => {
    const customLinks = socialLinks.customLinks || [];
    const newLink: SocialLink = {
      title: '',
      url: '',
      icon: 'link-outline',
    };

    onChange({
      ...socialLinks,
      customLinks: [...customLinks, newLink],
    });
  };

  const handleCustomLinkChange = (index: number, field: 'title' | 'url' | 'icon', value: string) => {
    const customLinks = [...(socialLinks.customLinks || [])];
    customLinks[index] = {
      ...customLinks[index],
      [field]: value,
    };

    onChange({
      ...socialLinks,
      customLinks,
    });
  };

  const handleRemoveCustomLink = (index: number) => {
    const customLinks = [...(socialLinks.customLinks || [])];
    customLinks.splice(index, 1);

    onChange({
      ...socialLinks,
      customLinks,
    });
  };

  const hasAnyLinks = platforms.some(p => socialLinks[p as keyof SocialLinksType]) ||
    (socialLinks.customLinks && socialLinks.customLinks.length > 0);

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="link-outline" size={24} color={colors.accent.gold} />
          <View>
            <Text style={styles.headerTitle}>Social Links</Text>
            <Text style={styles.headerSubtitle}>
              {hasAnyLinks ? 'Links added' : 'Add your social media profiles'}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.sectionDescription}>
            Connect your social media profiles to showcase your work and grow your following.
          </Text>

          {/* Main Platforms */}
          <View style={styles.platformsContainer}>
            {platforms.map(platform => {
              const platformConfig = SOCIAL_PLATFORMS[platform];
              const value = (socialLinks[platform as keyof SocialLinksType] as string) || '';

              return (
                <View key={platform} style={styles.platformItem}>
                  <View style={styles.platformHeader}>
                    <View style={[styles.platformIcon, { backgroundColor: platformConfig.color + '20' }]}>
                      <Ionicons
                        name={platformConfig.icon as any}
                        size={20}
                        color={platformConfig.color}
                      />
                    </View>
                    <Text style={styles.platformName}>{platformConfig.name}</Text>
                  </View>
                  <Input
                    placeholder={platformConfig.placeholder}
                    value={value}
                    onChangeText={(text) => handleLinkChange(platform, text)}
                    onBlur={() => handleLinkBlur(platform)}
                    error={errors[platform]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
              );
            })}
          </View>

          {/* Custom Links */}
          {socialLinks.customLinks && socialLinks.customLinks.length > 0 && (
            <View style={styles.customLinksContainer}>
              <Text style={styles.customLinksTitle}>Custom Links</Text>
              {socialLinks.customLinks.map((link, index) => (
                <Card key={index} style={styles.customLinkCard}>
                  <View style={styles.customLinkHeader}>
                    <Text style={styles.customLinkNumber}>Link {index + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemoveCustomLink(index)}>
                      <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                  <Input
                    label="Title"
                    placeholder="e.g., My Shop, Book Here"
                    value={link.title}
                    onChangeText={(text) => handleCustomLinkChange(index, 'title', text)}
                  />
                  <Input
                    label="URL"
                    placeholder="https://example.com"
                    value={link.url}
                    onChangeText={(text) => handleCustomLinkChange(index, 'url', text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </Card>
              ))}
            </View>
          )}

          {/* Add Custom Link Button */}
          <Button
            title="Add Custom Link"
            onPress={handleAddCustomLink}
            variant="outline"
            size="medium"
            icon="add-circle-outline"
            style={{ marginTop: spacing.md }}
          />

          <View style={styles.tipContainer}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accent.blue} />
            <Text style={styles.tipText}>
              You can enter just your username or the full URL. We'll format it automatically.
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerTitle: {
    ...textStyles.body,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionDescription: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  platformsContainer: {
    gap: spacing.lg,
  },
  platformItem: {
    gap: spacing.sm,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformName: {
    ...textStyles.body,
    fontWeight: '600',
  },
  customLinksContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  customLinksTitle: {
    ...textStyles.h4,
    fontWeight: '700',
  },
  customLinkCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  customLinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  customLinkNumber: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tipContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.accent.blue + '10',
    borderRadius: borderRadius.md,
  },
  tipText: {
    ...textStyles.bodySmall,
    color: colors.accent.blue,
    flex: 1,
  },
});
