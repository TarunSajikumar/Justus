import { api } from './api';
import { clearAuthData, saveAuthData } from '../store/authStore';
import { useAuthStore } from '../store/authStore';

export const authService = {
  /** POST /api/auth/send-otp */
  sendOtp: async (contact: string) => {
    const response = await api.post('/auth/send-otp', { email: contact });
    return response.data;
  },

  /** POST /api/auth/verify-otp → { success, verified, isNewUser, token, user } */
  verifyOtp: async (contact: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email: contact, otp });
    return response.data;
  },

  /** POST /api/auth/signup → { user, token } */
  signup: async (data: { name: string; email?: string; phone?: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  /** PUT /api/auth/profile */
  completeProfile: async (data: { fullName: string; dob?: string; gender?: string }) => {
    const response = await api.put('/auth/profile', {
      name: data.fullName,
      birthday: data.dob,
      gender: data.gender,
    });
    return response.data;
  },

  /**
   * GET /api/auth/me
   * Returns full user profile including relationship_status, couple_id, and resolved partner.
   * Updates the store automatically.
   */
  me: async () => {
    const response = await api.get('/auth/me');
    const profile = response.data;
    const { setUser, setPartner } = useAuthStore.getState();
    setUser(profile);
    setPartner(profile.partner ?? null);
    // Persist updated user to local storage
    const token = useAuthStore.getState().token;
    if (token) {
      await saveAuthData(token, profile);
    }
    return profile;
  },

  /** GET /api/dashboard */
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  logout: async () => {
    await clearAuthData();
    useAuthStore.getState().logout();
  },
};
