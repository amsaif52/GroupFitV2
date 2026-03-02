import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiErrorBody } from './types';
import { ApiClientError } from './client';

export type AxiosApiClientConfig = {
  baseURL: string;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
  /** Extra Axios config (headers, timeout, etc.) */
  axiosConfig?: AxiosRequestConfig;
};

/**
 * Create an Axios instance configured for the GroupFit API: base URL, Bearer token,
 * and error handling that throws ApiClientError and triggers onUnauthorized for 401.
 * Use in web and React Native UIs.
 */
export function createAxiosApiClient(config: AxiosApiClientConfig): AxiosInstance {
  const { baseURL, getAccessToken, onUnauthorized, axiosConfig = {} } = config;
  const base = baseURL.replace(/\/$/, '');

  const instance = axios.create({
    baseURL: base,
    headers: { 'Content-Type': 'application/json' },
    ...axiosConfig,
  });

  instance.interceptors.request.use((req) => {
    const token = getAccessToken?.() ?? null;
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (!axios.isAxiosError(err) || !err.response) {
        throw err;
      }
      const status = err.response.status;
      const body = err.response.data as ApiErrorBody | undefined;
      if (status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      throw new ApiClientError(
        body?.message ?? err.message ?? 'Request failed',
        status,
        body,
      );
    }
  );

  return instance;
}
