import type { ApiErrorBody } from './types';

export type ApiClientConfig = {
  baseUrl: string;
  getAccessToken?: () => string | null;
  onUnauthorized?: () => void;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Create a fetch-based API client. Use from web (get baseUrl from env) or RN apps.
 */
export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getAccessToken, onUnauthorized } = config;
  const base = baseUrl.replace(/\/$/, '');

  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
    const token = getAccessToken?.() ?? null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let body: ApiErrorBody | undefined;
      try {
        body = await res.json();
      } catch {
        // ignore
      }
      if (res.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      throw new ApiClientError(
        body?.message ?? res.statusText,
        res.status,
        body,
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
