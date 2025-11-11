import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user.types';
import { logOut } from '../services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user: User, accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  signIn: async (user, accessToken) => {
    await AsyncStorage.setItem('@user', JSON.stringify(user));
    await AsyncStorage.setItem('@token', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  signOut: async () => {
    try {
      // Sign out from Firebase first
      await logOut();
    } catch (error) {
      console.error('Firebase logout error:', error);
      // Continue with local signout even if Firebase fails
    }
    // Clear local storage
    await AsyncStorage.multiRemove(['@user', '@token']);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const user = await AsyncStorage.getItem('@user');
      const token = await AsyncStorage.getItem('@token');
      if (user && token) {
        set({ user: JSON.parse(user), accessToken: token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
