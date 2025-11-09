import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

// Placeholder screens - we'll build these next
import { View as RNView, Text } from 'react-native';

const FeedScreen = () => (
  <RNView style={styles.screen}><Text style={styles.text}>Feed</Text></RNView>
);

const DiscoverScreen = () => (
  <RNView style={styles.screen}><Text style={styles.text}>Discover</Text></RNView>
);

const CreateScreen = () => (
  <RNView style={styles.screen}><Text style={styles.text}>Create</Text></RNView>
);

const BookingScreen = () => (
  <RNView style={styles.screen}><Text style={styles.text}>Bookings</Text></RNView>
);

const ProfileScreen = () => (
  <RNView style={styles.screen}><Text style={styles.text}>Profile</Text></RNView>
);

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Feed':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Discover':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Create':
              iconName = 'add-circle';
              size = 44;
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          if (route.name === 'Create') {
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
        tabBarShowLabel: route.name !== 'Create',
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Bookings" component={BookingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
  },
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
