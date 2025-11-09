import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { CreatePostScreen } from '../screens/feed/CreatePostScreen';

const Tab = createBottomTabNavigator();

// Barber-focused navigation - full featured with content creation
export const BarberTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'FeedTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'DiscoverTab':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'CreateTab':
              iconName = 'add-circle';
              size = 44;
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

          if (route.name === 'CreateTab') {
            return (
              <View style={styles.createButton}>
                <LinearGradient
                  colors={['#D4AF37', '#FFD700', '#D4AF37']}
                  style={styles.createGradient}
                >
                  <Ionicons name={iconName} size={size} color="#000" />
                </LinearGradient>
              </View>
            );
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
        tabBarShowLabel: route.name !== 'CreateTab',
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreatePostScreen}
        options={{ tabBarLabel: 'Create' }}
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
  createButton: {
    marginTop: -20,
  },
  createGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background.card,
  },
});
