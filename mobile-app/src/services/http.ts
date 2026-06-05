import axios from "axios";
import { storageService } from './storageService';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

console.log(`🌐 HTTP BASE_URL: ${BASE_URL}`);

// Render free tier can take 30-60s to cold-start — use a generous timeout
// Reduced from 120s since we fixed SMTP email sending
const REQUEST_TIMEOUT = 30000; // 30 seconds

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug interceptors
http.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase() || 'UNKNOWN';
  const url = `${config.baseURL || ''}${config.url || ''}`;
  console.log(
    `🔵 REQUEST: ${method} ${url}`
  );
  return config;
});

http.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.status} ${response.statusText}`);
    return response;
  },
  async (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config ? error.config.url : '';

    if (error.response) {
      console.log(`❌ ERROR: ${error.response.status} - ${error.response.statusText}`);
      console.log(`📝 ERROR DATA:`, error.response.data);

      // Handle logout on 401 or 404 for /auth/me
      if (status === 401 || (status === 404 && url?.includes('/auth/me'))) {
        console.log(`🚪 Logging out user due to ${status === 401 ? 'unauthorized' : '404'} response`);
        await storageService.deleteItem('userToken');
        // Note: We don't import useAuthStore here to avoid circular dependency
        // The logout will be handled by the component/hook that called this
      }
    } else if (error.request) {
      console.log(`⚠️ NO RESPONSE:`, error.request);
    } else {
      console.log(`🔴 ERROR:`, error.message);
    }

    return Promise.reject(error);
  }
);
