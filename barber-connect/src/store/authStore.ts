import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
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
    // Use SecureStore for encrypted storage of sensitive data
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('token', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
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
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const user = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');
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
