/**
 * API Configuration
 * Centralized API configuration for the Morglaiban Admin Frontend
 */

// =============================================================================
// Environment Variables
// =============================================================================

/**
 * API Base URL (without prefix)
 */
const baseURL = process.env['NEXT_PUBLIC_API_URL'] || 'https://api-telemed.risingsun.dev';

/**
 * API Prefix
 */
const apiPrefix = process.env['NEXT_PUBLIC_API_PREFIX'] || '/api/v1';

/**
 * Full API URL (base + prefix)
 */
export const apiURL = `${baseURL}${apiPrefix}`;

/**
 * API Key for external services
 */
export const apiKey = process.env['NEXT_PUBLIC_API_KEY'] || '';

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = Number(process.env['NEXT_PUBLIC_API_TIMEOUT']) || 30000;

// =============================================================================
// API Endpoints
// =============================================================================

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/sessions/username/',
  REFRESH: '/auth/token/refresh/',
  LOGOUT: '/auth/sessions/',
} as const;

/**
 * User management endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: '/users/profile/',
  UPDATE: '/users/update/',
} as const;

/**
 * Doctor management endpoints
 */
export const DOCTOR_ENDPOINTS = {
  LIST: '/doctors/',
  CREATE: '/doctors/',
  UPDATE: '/doctors/',
  DELETE: '/doctors/',
} as const;

/**
 * Patient management endpoints
 */
export const PATIENT_ENDPOINTS = {
  LIST: '/patients/',
  CREATE: '/patients/',
  UPDATE: '/patients/',
  DELETE: '/patients/',
  DETAIL: '/patients/',
} as const;

/**
 * Rider management endpoints
 */
export const RIDER_ENDPOINTS = {
  LIST: '/riders/',
  CREATE: '/riders/',
  UPDATE: '/riders/',
  DELETE: '/riders/',
  DETAIL: '/riders/',
  INCOME: '/riders/income/',
} as const;

/**
 * Service area endpoints
 */
export const SERVICE_AREA_ENDPOINTS = {
  LIST: '/service-areas/',
  CREATE: '/service-areas/',
  UPDATE: '/service-areas/',
  DELETE: '/service-areas/',
} as const;

/**
 * Stock management endpoints
 */
export const STOCK_ENDPOINTS = {
  LIST: '/stocks/',
  CREATE: '/stocks/',
  UPDATE: '/stocks/',
  DELETE: '/stocks/',
} as const;

/**
 * Report endpoints
 */
export const REPORT_ENDPOINTS = {
  OVERVIEW: '/reports/overview/',
  PATIENTS: '/reports/patients/',
  RIDERS: '/reports/riders/',
  SERVICES: '/reports/services/',
} as const;

// =============================================================================
// API Configuration Object
// =============================================================================

export const apiConfig = {
  baseURL: apiURL,
  apiKey,
  timeout: API_TIMEOUT,
  endpoints: {
    auth: AUTH_ENDPOINTS,
    users: USER_ENDPOINTS,
    doctors: DOCTOR_ENDPOINTS,
    patients: PATIENT_ENDPOINTS,
    riders: RIDER_ENDPOINTS,
    serviceAreas: SERVICE_AREA_ENDPOINTS,
    stocks: STOCK_ENDPOINTS,
    reports: REPORT_ENDPOINTS,
  },
} as const;

// =============================================================================
// Default Export
// =============================================================================

export default apiConfig;
