import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for adding token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for handling errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('userToken');
      // You might want to trigger a logout in your store here
      // But since we don't have direct access to the store here easily without circular dependencies
      // we can at least clear the token.
    }
    return Promise.reject(error);
  }
);
