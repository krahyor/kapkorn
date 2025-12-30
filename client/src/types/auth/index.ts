/**
 * Authentication Types
 * Comprehensive type definitions for authentication, authorization, and user management
 * in the Morglaiban admin frontend system.
 *
 * This file defines the core interfaces for:
 * - User entities and authentication state
 * - Login credentials and registration data
 * - Permission-based access control
 * - Authentication tokens and session management
 */

/**
 * Core User entity representing a system user
 *
 * @example
 * ```tsx
 * const user: User = {
 *   user_id: 'user-123',
 *   email: 'admin@morglaiban.com',
 *   first_name: 'Admin',
 *   last_name: 'User',
 *   mobile_number: '0612345678',
 *   permissions: ['users.read', 'users.write', 'doctors.read'],
 *   created_at: '2024-01-01T00:00:00Z',
 *   updated_at: '2024-01-15T10:30:00Z',
 *   last_login: '2024-01-16T09:15:00Z',
 *   is_active: true
 * };
 * ```
 */
export interface User {
  /** Unique identifier for the user */
  user_id: string;
  /** User's email address (used for login) */
  email: string;
  /** User's first name (Thai or English) */
  first_name: string;
  /** User's last name (Thai or English) */
  last_name: string;
  /** Mobile number in Thai format (e.g., 0612345678) */
  mobile_number: string;
  /** Array of permission strings defining user access rights */
  permissions: string[];
  /** ISO timestamp when user account was created */
  created_at: string;
  /** ISO timestamp when user account was last updated */
  updated_at: string;
  /** ISO timestamp of last successful login */
  last_login: string;
  /** Whether the user account is currently active */
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'DOCTOR' | 'RIDER' | 'PATIENT';

export type Permission =
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'doctors.read'
  | 'doctors.write'
  | 'doctors.delete'
  | 'patients.read'
  | 'patients.write'
  | 'patients.delete'
  | 'riders.read'
  | 'riders.write'
  | 'riders.delete'
  | 'service_areas.read'
  | 'service_areas.write'
  | 'service_areas.delete'
  | 'stocks.read'
  | 'stocks.write'
  | 'stocks.delete'
  | 'reports.read'
  | 'reports.write'
  | 'system.admin';
