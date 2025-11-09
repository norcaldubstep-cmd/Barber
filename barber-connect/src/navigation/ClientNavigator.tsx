import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { BookingsScreen } from '../screens/booking/BookingsScreen';

const Tab = createBottomTabNavigator();

// Client-focused navigation - simpler, focused on finding and booking barbers
export const ClientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'DiscoverTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'BookingsTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'MessagesTab':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent.gold,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={ClientHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // No special styles needed for client nav
});
