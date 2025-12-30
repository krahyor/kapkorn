/**
 * Configuration Module
 * Barrel export for all configuration files
 */

// =============================================================================
// Configuration Exports
// =============================================================================

export * from './api.config';
export * from './app.config';
export * from './navigation';

// =============================================================================
// Default Exports
// =============================================================================

export { default as apiConfig } from './api.config';
export { default as appConfig } from './app.config';
export { default as navigationConfig } from './navigation';

// =============================================================================
// Legacy Compatibility
// =============================================================================

// Re-export from old config for backward compatibility
// TODO: Remove these after migration is complete
export const publicURL =
  process.env['PUBLIC_URL'] || process.env['NEXT_PUBLIC_URL'] || 'http://localhost:3000';
export const baseAPI =
  process.env['API_URL'] || process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8080';
export const prefixAPI =
  process.env['API_PREFIX'] || process.env['NEXT_PUBLIC_API_PREFIX'] || '/api/v1';
export const apiURL = `${baseAPI}${prefixAPI || ''}`;
export const apiKey = process.env['API_KEY'] || process.env['NEXT_PUBLIC_API_KEY'];
export const xApiKey = process.env['NEXT_PUBLIC_X_API_KEY'] || process.env['X_API_KEY'];
export const authSecretKey =
  process.env['NEXTAUTH_SECRET'] ?? process.env['AUTH_SECRET'] ?? 'auth_secret';
export const useSecureCookies = Boolean(
  (process.env['NEXTAUTH_URL'] || publicURL)?.startsWith('https://')
);
export const callbackURLCookieName = `${useSecureCookies ? '__Secure-' : ''}${String(process.env['NEXTAUTH_CALLBACK_URL_COOKIE_NAME'] || 'auth.callback-url')}`;
export const sessionTokenCookieName = `${useSecureCookies ? '__Secure-' : ''}${String(process.env['NEXTAUTH_SESSION_TOKEN_COOKIE_NAME'] || 'auth.session-token')}`;
export const csrfTokenCookieName = `${useSecureCookies ? '__Host-' : ''}${String(process.env['NEXTAUTH_CSRF_TOKEN_COOKIE_NAME'] || 'auth.csrf-token')}`;
export const STORAGE_KEYS = {
  TABLE_SETTINGS: 'table-setting',
  USER_DATA: 'userData',
} as const;
export const TABLE_SETTING_STORAGE_COOKIE = STORAGE_KEYS.TABLE_SETTINGS;
export const DATA_TABLE_PAGESIZE_BY_DEFAULT = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const FEATURE_FLAGS = {
  USE_MOCK_API: process.env['NEXT_PUBLIC_USE_MOCK_API'] === 'true',
  ENABLE_DARK_MODE: process.env['NEXT_PUBLIC_ENABLE_DARK_MODE'] === 'true',
  ENABLE_NOTIFICATIONS: process.env['NEXT_PUBLIC_ENABLE_NOTIFICATIONS'] === 'true',
} as const;
export const APP_METADATA = {
  NAME: 'Morglaiban Admin',
  DESCRIPTION: 'Admin panel for หมอไกลบ้าน healthcare clinic system',
  VERSION: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
} as const;
export const API_TIMEOUT = Number(process.env['NEXT_PUBLIC_API_TIMEOUT']) || 30000;
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;
