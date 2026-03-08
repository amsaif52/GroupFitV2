import type { Role } from '../utils/constants';

/** User as returned by the API */
export interface ApiUser {
  id: string;
  email: string;
  role: Role;
  locale?: string;
  createdAt: string;
  updatedAt: string;
}

/** Login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Login success response */
export interface LoginResponse {
  accessToken: string;
  user: ApiUser;
}

/** Standard API error body (matches Nest BaseHttpException) */
export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Health check response */
export interface HealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}
