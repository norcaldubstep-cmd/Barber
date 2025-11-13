import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user.types';
import { logOut } from '../services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (user: User, accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,

  signIn: async (user, accessToken) => {
    // Use SecureStore for encrypted storage of sensitive data
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('token', accessToken);
    await AsyncStorage.removeItem('isGuest'); // Clear guest mode if signing in
    set({ user, accessToken, isAuthenticated: true, isGuest: false, isLoading: false });
  },

  signOut: async () => {
    try {
      // Sign out from Firebase first
      await logOut();
    } catch (error) {
      // console.error('Firebase logout error:', error);
      // Continue with local signout even if Firebase fails
    }
    // Clear secure storage
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    await AsyncStorage.removeItem('isGuest');
    set({ user: null, accessToken: null, isAuthenticated: false, isGuest: false });
  },

  continueAsGuest: async () => {
    // Set guest mode flag
    await AsyncStorage.setItem('isGuest', 'true');
    set({ isGuest: true, isAuthenticated: false, user: null, accessToken: null, isLoading: false });
  },

  loadStoredAuth: async () => {
    try {
      // Check for guest mode first
      const guestMode = await AsyncStorage.getItem('isGuest');
      if (guestMode === 'true') {
        set({ isGuest: true, isAuthenticated: false, isLoading: false });
        return;
      }

      // Check for authenticated user
      const user = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');
      if (user && token) {
        set({ user: JSON.parse(user), accessToken: token, isAuthenticated: true, isGuest: false, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
