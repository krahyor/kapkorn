export * from './common';
export * from './routes';

// Re-export commonly used config values (selective to avoid conflicts)
export {
  apiURL,
  baseAPI,
  prefixAPI,
  API_TIMEOUT,
  FEATURE_FLAGS,
  APP_METADATA,
  STORAGE_KEYS,
  DATA_TABLE_PAGESIZE_BY_DEFAULT,
  PAGE_SIZE_OPTIONS,
  UPLOAD_LIMITS,
} from '@/configs';