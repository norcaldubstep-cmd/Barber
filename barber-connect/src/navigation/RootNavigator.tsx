import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

// Placeholder screens
const AuthScreen = () => (
  <View style={styles.centered}><Text>Auth Screen - Coming Soon</Text></View>
);

const HomeScreen = () => (
  <View style={styles.centered}><Text>Home Screen - Coming Soon</Text></View>
);

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
