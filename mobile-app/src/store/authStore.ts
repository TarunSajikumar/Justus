import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// ─── Secure Storage Helpers ────────────────────────────────────────────────

export const saveAuthData = async (token: string, user: any) => {
  try {
    await SecureStore.setItemAsync('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  } catch (e) {
    console.error('Error saving auth data', e);
  }
};

export const getAuthData = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    const userStr = await AsyncStorage.getItem('userData');
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
    };
  } catch (e) {
    console.error('Error getting auth data', e);
    return null;
  }
};

export const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (e) {
    console.error('Error clearing auth data', e);
  }
};

// ─── Auth Zustand Store ────────────────────────────────────────────────────

interface AuthState {
  token: string | null;
  user: any | null;
  partner: any | null;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  setPartner: (partner: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  partner: null,
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setPartner: (partner) => set({ partner }),
  logout: () => set({ token: null, user: null, partner: null }),
}));
