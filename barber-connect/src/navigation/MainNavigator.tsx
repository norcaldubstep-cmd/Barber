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
import { BookingScreen } from '../screens/booking/BookingScreen';
import { BookingsScreen } from '../screens/booking/BookingsScreen';
import { ChatScreen } from '../screens/messages/ChatScreen';
import { JobBoardScreen } from '../screens/jobs/JobBoardScreen';
import { ScheduleEditorScreen } from '../screens/barber/ScheduleEditorScreen';
import { PromotionPlansScreen } from '../screens/barber/PromotionPlansScreen';
import { ReviewsScreen } from '../screens/barber/ReviewsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { FavoritesScreen } from '../screens/discover/FavoritesScreen';

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

      {/* Profile & Barber Screens */}
      <Stack.Screen name="BarberProfile" component={BarberProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />

      {/* Booking Screens */}
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />

      {/* Messaging Screens */}
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* Job Board Screens */}
      <Stack.Screen name="JobBoard" component={JobBoardScreen} />
      <Stack.Screen name="JobDetails" component={JobBoardScreen} />
      <Stack.Screen name="PostJob" component={JobBoardScreen} />

      {/* Barber Tools */}
      <Stack.Screen name="ScheduleEditor" component={ScheduleEditorScreen} />
      <Stack.Screen name="MyServices" component={ProfileScreen} />
      <Stack.Screen name="Portfolio" component={ProfileScreen} />
      <Stack.Screen name="PromotionPlans" component={PromotionPlansScreen} />

      {/* Other Screens */}
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  // Styles moved to role-specific navigators
});
