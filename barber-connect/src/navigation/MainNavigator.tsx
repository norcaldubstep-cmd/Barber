import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/user.types';

// Role-specific Tab Navigators
import { ClientTabNavigator } from './ClientNavigator';
import { BarberTabNavigator } from './BarberNavigator';

// Stack Screens
import { BarberProfileScreen } from '../screens/profile/BarberProfileScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UserProfileViewScreen } from '../screens/profile/UserProfileViewScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { BookingScreen } from '../screens/booking/BookingScreen';
import { BookingsScreen } from '../screens/booking/BookingsScreen';
import { RescheduleBookingScreen } from '../screens/booking/RescheduleBookingScreen';
import { ChatScreen } from '../screens/messages/ChatScreen';
import { JobBoardScreen } from '../screens/jobs/JobBoardScreen';
import { ScheduleEditorScreen } from '../screens/barber/ScheduleEditorScreen';
import { PromotionPlansScreen } from '../screens/barber/PromotionPlansScreen';
import { ReviewsScreen } from '../screens/barber/ReviewsScreen';
import { AnalyticsScreen } from '../screens/barber/AnalyticsScreen';
import { ServicesScreen } from '../screens/barber/ServicesScreen';
import { PortfolioScreen } from '../screens/barber/PortfolioScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { FavoritesScreen } from '../screens/discover/FavoritesScreen';
import { MapViewScreen } from '../screens/discover/MapViewScreen';
import { FiltersScreen } from '../screens/discover/FiltersScreen';
import { StoriesScreen } from '../screens/feed/StoriesScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { FollowersScreen } from '../screens/social/FollowersScreen';
import { UserSearchScreen } from '../screens/social/UserSearchScreen';
import { SavedPostsScreen } from '../screens/social/SavedPostsScreen';

const Stack = createNativeStackNavigator();

// Dynamic Tab Navigator based on user role
const TabNavigator = () => {
  const { user } = useAuthStore();
  const isClient = user?.role === UserRole.CLIENT;

  // Clients get a simplified 4-tab experience focused on discovery and booking
  // Barbers get the full 5-tab experience with content creation
  return isClient ? <ClientTabNavigator /> : <BarberTabNavigator />;
};

// Main Navigator with Stack
export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Onboarding */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Profile & Barber Screens */}
      <Stack.Screen name="BarberProfile" component={BarberProfileScreen} />
      <Stack.Screen name="UserProfileView" component={UserProfileViewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />

      {/* Booking Screens */}
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
      <Stack.Screen name="RescheduleBooking" component={RescheduleBookingScreen} />

      {/* Messaging Screens */}
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* Feed & Stories */}
      <Stack.Screen name="Stories" component={StoriesScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />

      {/* Social Screens */}
      <Stack.Screen name="Followers" component={FollowersScreen} />
      <Stack.Screen name="UserSearch" component={UserSearchScreen} />
      <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />

      {/* Job Board Screens */}
      <Stack.Screen name="JobBoard" component={JobBoardScreen} />
      <Stack.Screen name="JobDetails" component={JobBoardScreen} />
      <Stack.Screen name="PostJob" component={JobBoardScreen} />

      {/* Barber Tools */}
      <Stack.Screen name="ScheduleEditor" component={ScheduleEditorScreen} />
      <Stack.Screen name="MyServices" component={ServicesScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Portfolio" component={PortfolioScreen} />
      <Stack.Screen name="PromotionPlans" component={PromotionPlansScreen} />

      {/* Discovery Screens */}
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="MapView" component={MapViewScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} />

      {/* Other Screens */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  // Styles moved to role-specific navigators
});
