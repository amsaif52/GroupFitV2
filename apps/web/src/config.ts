const DEFAULT_API_BASE = 'http://localhost:3001/api';

/**
 * API base URL for server and client.
 * On the server: prefers API_URL (e.g. internal), then NEXT_PUBLIC_API_URL, then default.
 * In the browser: only NEXT_PUBLIC_API_URL is available, then default.
 */
export function getApiBaseUrl(): string {
  return (
    (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL
      : (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)) ?? DEFAULT_API_BASE
  );
}
