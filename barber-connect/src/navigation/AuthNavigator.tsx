import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { UserRole } from '../types/user.types';

// Placeholder screens until we build them
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/common/Button';
import { colors, spacing } from '../theme';

const SignInScreen = ({ navigation }: any) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Sign In Screen</Text>
    <Button title="Go to Welcome" onPress={() => navigation.navigate('Welcome')} />
  </View>
);

const SignUpScreen = ({ navigation }: any) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Sign Up Screen</Text>
    <Button title="Go Back" onPress={() => navigation.goBack()} />
  </View>
);

export type AuthStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  SignIn: undefined;
  SignUp: { role: UserRole };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
});
