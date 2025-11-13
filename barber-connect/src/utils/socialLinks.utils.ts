/**
 * Social Links Utilities
 * Helpers for validating and formatting social media URLs
 */

export interface SocialPlatform {
  name: string;
  icon: string;
  placeholder: string;
  baseUrl: string;
  color: string;
  validator: (url: string) => boolean;
  formatter: (input: string) => string;
}

export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  instagram: {
    name: 'Instagram',
    icon: 'logo-instagram',
    placeholder: 'username or instagram.com/username',
    baseUrl: 'https://instagram.com/',
    color: '#E4405F',
    validator: (url: string) => {
      const pattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
      return pattern.test(url) || /^[a-zA-Z0-9._]+$/.test(url);
    },
    formatter: (input: string) => {
      if (!input) return '';
      // Remove whitespace
      input = input.trim();
      // If already a full URL, return as is
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      // If starts with instagram.com, add https
      if (input.startsWith('instagram.com/')) {
        return `https://${input}`;
      }
      // If just username, build full URL
      return `https://instagram.com/${input.replace('@', '')}`;
    },
  },
  tiktok: {
    name: 'TikTok',
    icon: 'logo-tiktok',
    placeholder: 'username or tiktok.com/@username',
    baseUrl: 'https://tiktok.com/@',
    color: '#000000',
    validator: (url: string) => {
      const pattern = /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/;
      return pattern.test(url) || /^@?[a-zA-Z0-9._]+$/.test(url);
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      if (input.startsWith('tiktok.com/@')) {
        return `https://${input}`;
      }
      const username = input.replace('@', '');
      return `https://tiktok.com/@${username}`;
    },
  },
  facebook: {
    name: 'Facebook',
    icon: 'logo-facebook',
    placeholder: 'username or facebook.com/username',
    baseUrl: 'https://facebook.com/',
    color: '#1877F2',
    validator: (url: string) => {
      const pattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/;
      return pattern.test(url) || /^[a-zA-Z0-9.]+$/.test(url);
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      if (input.startsWith('facebook.com/')) {
        return `https://${input}`;
      }
      return `https://facebook.com/${input}`;
    },
  },
  youtube: {
    name: 'YouTube',
    icon: 'logo-youtube',
    placeholder: 'channel URL or youtube.com/c/channelname',
    baseUrl: 'https://youtube.com/c/',
    color: '#FF0000',
    validator: (url: string) => {
      const pattern = /^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|channel\/|@)?[a-zA-Z0-9_-]+\/?$/;
      return pattern.test(url) || /^[a-zA-Z0-9_-]+$/.test(url);
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      if (input.startsWith('youtube.com/')) {
        return `https://${input}`;
      }
      return `https://youtube.com/c/${input}`;
    },
  },
  twitter: {
    name: 'Twitter',
    icon: 'logo-twitter',
    placeholder: 'username or twitter.com/username',
    baseUrl: 'https://twitter.com/',
    color: '#1DA1F2',
    validator: (url: string) => {
      const pattern = /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/;
      return pattern.test(url) || /^@?[a-zA-Z0-9_]+$/.test(url);
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      if (input.startsWith('twitter.com/') || input.startsWith('x.com/')) {
        return `https://${input}`;
      }
      const username = input.replace('@', '');
      return `https://twitter.com/${username}`;
    },
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'logo-linkedin',
    placeholder: 'linkedin.com/in/username',
    baseUrl: 'https://linkedin.com/in/',
    color: '#0A66C2',
    validator: (url: string) => {
      const pattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
      return pattern.test(url) || /^[a-zA-Z0-9-]+$/.test(url);
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      if (input.startsWith('linkedin.com/in/')) {
        return `https://${input}`;
      }
      return `https://linkedin.com/in/${input}`;
    },
  },
  website: {
    name: 'Website',
    icon: 'globe-outline',
    placeholder: 'https://yourwebsite.com',
    baseUrl: 'https://',
    color: '#666666',
    validator: (url: string) => {
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      return `https://${input}`;
    },
  },
  bookingUrl: {
    name: 'Booking Site',
    icon: 'calendar-outline',
    placeholder: 'https://booking-site.com/your-shop',
    baseUrl: 'https://',
    color: '#D4AF37',
    validator: (url: string) => {
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    },
    formatter: (input: string) => {
      if (!input) return '';
      input = input.trim();
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return input;
      }
      return `https://${input}`;
    },
  },
};

/**
 * Validate a URL for a specific platform
 */
export const validateSocialUrl = (platform: string, url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  const platformConfig = SOCIAL_PLATFORMS[platform];
  if (!platformConfig) return true;
  return platformConfig.validator(url);
};

/**
 * Format a URL for a specific platform
 */
export const formatSocialUrl = (platform: string, input: string): string => {
  if (!input) return '';
  const platformConfig = SOCIAL_PLATFORMS[platform];
  if (!platformConfig) return input;
  return platformConfig.formatter(input);
};

/**
 * Get display text for a social URL (remove protocol, shorten)
 */
export const getDisplayUrl = (url: string): string => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    let display = urlObj.hostname + urlObj.pathname;
    // Remove www
    display = display.replace('www.', '');
    // Remove trailing slash
    display = display.replace(/\/$/, '');
    return display;
  } catch {
    return url;
  }
};

/**
 * Extract username from social media URL
 */
export const extractUsername = (platform: string, url: string): string => {
  if (!url) return '';

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = urlObj.pathname;

    switch (platform) {
      case 'instagram':
      case 'facebook':
      case 'twitter':
        // Remove leading slash and any trailing slashes
        return pathname.replace(/^\/|\/$/g, '');
      case 'tiktok':
        // Remove @ and slashes
        return pathname.replace(/^\/@?|\/$/g, '');
      case 'youtube':
        // Handle /c/, /channel/, or /@
        return pathname.replace(/^\/(c\/|channel\/|@)?|\/$/g, '');
      case 'linkedin':
        // Remove /in/ prefix
        return pathname.replace(/^\/in\/|\/$/g, '');
      default:
        return pathname.replace(/^\/|\/$/g, '');
    }
  } catch {
    return url;
  }
};

/**
 * Count total number of social links
 */
export const countSocialLinks = (socialLinks?: any): number => {
  if (!socialLinks) return 0;

  let count = 0;
  const platforms = ['instagram', 'tiktok', 'facebook', 'youtube', 'twitter', 'linkedin', 'website', 'bookingUrl'];

  platforms.forEach(platform => {
    if (socialLinks[platform]) count++;
  });

  if (socialLinks.customLinks && Array.isArray(socialLinks.customLinks)) {
    count += socialLinks.customLinks.length;
  }

  return count;
};

/**
 * Check if barber has any social links
 */
export const hasSocialLinks = (socialLinks?: any): boolean => {
  return countSocialLinks(socialLinks) > 0;
};
