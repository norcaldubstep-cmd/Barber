import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, textStyles } from '../../theme';

interface AvatarProps {
  imageUrl?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  verified?: boolean;
  online?: boolean;
  onPress?: () => void;
  showGradientBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
  verified = false,
  online = false,
  onPress,
  showGradientBorder = false,
}) => {
  const sizes = {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 64,
    xl: 80,
    '2xl': 120,
  };

  const avatarSize = sizes[size];
  const fontSize = avatarSize / 2.5;

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const AvatarContent = () => (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
      {showGradientBorder && (
        <LinearGradient
          colors={['#D4AF37', '#FFD700', '#D4AF37']}
          style={[styles.gradientBorder, { width: avatarSize + 4, height: avatarSize + 4 }]}
        />
      )}
      <View style={[styles.avatar, { width: avatarSize, height: avatarSize }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={[styles.image, { borderRadius: avatarSize / 2 }]} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.accent.gold + '30' }]}>
            <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
          </View>
        )}
      </View>
      {verified && (
        <View style={[styles.badge, styles.verifiedBadge, { bottom: size === 'xs' || size === 'sm' ? -2 : 0 }]}>
          <Ionicons name="checkmark-circle" size={size === 'xs' || size === 'sm' ? 16 : 20} color={colors.accent.blue} />
        </View>
      )}
      {online && (
        <View style={[styles.badge, styles.onlineBadge, { width: avatarSize / 5, height: avatarSize / 5 }]} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBorder: {
    position: 'absolute',
    borderRadius: 9999,
  },
  avatar: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.accent.gold,
  },
  badge: {
    position: 'absolute',
    right: 0,
  },
  verifiedBadge: {
    backgroundColor: colors.background.card,
    borderRadius: 9999,
  },
  onlineBadge: {
    bottom: 0,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background.card,
    borderRadius: 9999,
  },
});
