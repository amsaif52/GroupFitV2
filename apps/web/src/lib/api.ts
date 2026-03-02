import { createAxiosApiClient } from '@groupfit/shared';
import { getStoredToken, clearStoredToken } from './auth';

const baseURL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

/** Axios instance for calling the API. Use api.get(), api.post(), etc. */
export const api = createAxiosApiClient({
  baseURL,
  getAccessToken: getStoredToken,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      clearStoredToken();
      window.location.href = '/login';
    }
  },
});

