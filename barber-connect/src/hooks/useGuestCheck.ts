import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to check if user is a guest and show appropriate prompts
 *
 * Usage:
 * const { isGuest, showGuestPrompt, GuestPromptComponent } = useGuestCheck(navigation);
 *
 * // Check before allowing action
 * const handleBooking = () => {
 *   if (isGuest) {
 *     showGuestPrompt('book appointments');
 *     return;
 *   }
 *   // Proceed with booking
 * };
 */
export const useGuestCheck = (navigation: any) => {
  const { isGuest, isAuthenticated } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptFeature, setPromptFeature] = useState('this feature');

  const showGuestPrompt = (feature: string = 'this feature') => {
    setPromptFeature(feature);
    setShowPrompt(true);
  };

  const handleSignUp = () => {
    setShowPrompt(false);
    navigation.navigate('RoleSelection');
  };

  const handleSignIn = () => {
    setShowPrompt(false);
    navigation.navigate('SignIn');
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return {
    isGuest,
    isAuthenticated,
    showGuestPrompt,
    promptVisible: showPrompt,
    promptFeature,
    handleSignUp,
    handleSignIn,
    handleClose,
  };
};

/**
 * Helper function to check if a feature requires authentication
 */
export const requiresAuth = (feature: GuestRestrictedFeature): boolean => {
  return GUEST_RESTRICTED_FEATURES.includes(feature);
};

/**
 * Features that require authentication (guests cannot access)
 */
export type GuestRestrictedFeature =
  | 'booking'
  | 'messaging'
  | 'following'
  | 'liking'
  | 'commenting'
  | 'posting'
  | 'saving'
  | 'reviewing'
  | 'profile'
  | 'settings';

export const GUEST_RESTRICTED_FEATURES: GuestRestrictedFeature[] = [
  'booking',
  'messaging',
  'following',
  'liking',
  'commenting',
  'posting',
  'saving',
  'reviewing',
  'profile',
  'settings',
];

/**
 * Features that guests CAN access
 */
export type GuestAllowedFeature =
  | 'discover'
  | 'search'
  | 'viewProfile'
  | 'viewPosts'
  | 'location'
  | 'browse';

export const GUEST_ALLOWED_FEATURES: GuestAllowedFeature[] = [
  'discover',
  'search',
  'viewProfile',
  'viewPosts',
  'location',
  'browse',
];

/**
 * Get user-friendly feature names for display
 */
export const getFeatureDisplayName = (feature: GuestRestrictedFeature): string => {
  const displayNames: Record<GuestRestrictedFeature, string> = {
    booking: 'book appointments',
    messaging: 'send messages',
    following: 'follow barbers',
    liking: 'like posts',
    commenting: 'comment on posts',
    posting: 'create posts',
    saving: 'save favorites',
    reviewing: 'write reviews',
    profile: 'access your profile',
    settings: 'access settings',
  };

  return displayNames[feature];
};
