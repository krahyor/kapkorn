/**
 * Application Configuration
 * Centralized app configuration for the Morglaiban Admin Frontend
 */

// =============================================================================
// Environment Variables
// =============================================================================

/**
 * Public URL for the application
 */
export const publicURL =
  process.env['PUBLIC_URL'] || process.env['NEXT_PUBLIC_URL'] || 'http://localhost:3000';

/**
 * Application environment
 */
export const environment = process.env['NODE_ENV'] || 'development';

/**
 * Application version
 */
export const appVersion = process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0';

// =============================================================================
// Application Metadata
// =============================================================================

/**
 * Application metadata
 */
export const APP_METADATA = {
  NAME: 'Morglaiban Admin',
  DESCRIPTION: 'Admin panel for หมอไกลบ้าน healthcare clinic system',
  VERSION: appVersion,
  AUTHOR: 'Morglaiban Team',
  HOMEPAGE: publicURL,
} as const;

/**
 * SEO metadata
 */
export const SEO_METADATA = {
  title: `${APP_METADATA.NAME} - ${APP_METADATA.DESCRIPTION}`,
  description: APP_METADATA.DESCRIPTION,
  keywords: ['เก็บของ', 'คลินิก', 'ระบบจัดการ', 'โรงพยาบาล', 'admin'],
  author: APP_METADATA.AUTHOR,
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: publicURL,
    siteName: APP_METADATA.NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_METADATA.NAME,
    description: APP_METADATA.DESCRIPTION,
  },
} as const;

// =============================================================================
// Feature Flags
// =============================================================================

/**
 * Feature flags for toggling features
 */
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: process.env['NEXT_PUBLIC_ENABLE_DARK_MODE'] === 'true',
  ENABLE_NOTIFICATIONS: process.env['NEXT_PUBLIC_ENABLE_NOTIFICATIONS'] === 'true',
  ENABLE_ANALYTICS: process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'] === 'true',
  ENABLE_PERFORMANCE_MONITORING:
    process.env['NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING'] === 'true',
  ENABLE_ERROR_REPORTING: process.env['NEXT_PUBLIC_ENABLE_ERROR_REPORTING'] === 'true',
} as const;

// =============================================================================
// Application Settings
// =============================================================================

/**
 * Data table settings
 */
export const DATA_TABLE_SETTINGS = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  DEFAULT_SORTING: [{ id: 'createdAt', desc: true }] as const,
} as const;

/**
 * File upload settings
 */
export const UPLOAD_SETTINGS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
} as const;

/**
 * Session settings
 */
export const SESSION_SETTINGS = {
  MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  UPDATE_AGE: 60 * 60, // 1 hour in seconds
  CSRF_MAX_AGE: 60 * 60 * 24, // 24 hours in seconds
} as const;

// =============================================================================
// Development Settings
// =============================================================================

/**
 * Development-specific settings
 */
export const DEV_SETTINGS = {
  ENABLE_LOGGING: environment === 'development',
  ENABLE_DEBUG_MODE: process.env['NEXT_PUBLIC_DEBUG_MODE'] === 'true',
  LOG_API_CALLS: process.env['NEXT_PUBLIC_LOG_API_CALLS'] === 'true',
  LOG_PERFORMANCE: process.env['NEXT_PUBLIC_LOG_PERFORMANCE'] === 'true',
} as const;

// =============================================================================
// Production Settings
// =============================================================================

/**
 * Production-specific settings
 */
export const PROD_SETTINGS = {
  ENABLE_ANALYTICS: environment === 'production',
  ENABLE_ERROR_REPORTING: environment === 'production',
  ENABLE_PERFORMANCE_MONITORING: environment === 'production',
  MINIFY_BUNDLES: true,
  ENABLE_SOURCE_MAPS: false,
} as const;

// =============================================================================
// Application Configuration Object
// =============================================================================

export const appConfig = {
  metadata: APP_METADATA,
  seo: SEO_METADATA,
  features: FEATURE_FLAGS,
  settings: {
    dataTable: DATA_TABLE_SETTINGS,
    upload: UPLOAD_SETTINGS,
    session: SESSION_SETTINGS,
  },
  environment: {
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isTest: environment === 'test',
  },
  urls: {
    public: publicURL,
    api: process.env['NEXT_PUBLIC_API_URL'] || 'https://api-telemed.risingsun.dev/api/v1',
  },
  development: DEV_SETTINGS,
  production: PROD_SETTINGS,
} as const;

// =============================================================================
// Default Export
// =============================================================================

export default appConfig;
