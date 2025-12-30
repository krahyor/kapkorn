/**
 * API Base Client
 * Enhanced fetch wrapper with JWT authentication, error handling, logging, and performance monitoring
 * Uses NextAuth with JWT access/refresh tokens for authentication
 */

import { apiURL, API_TIMEOUT, xApiKey } from '@/configs';
import { logTokenInfo, shouldRefreshToken } from '@/lib/auth/token.utils';
import querystring from 'query-string';

/**
 * Custom API Error class for structured error handling
 */
export class APIResponseError extends Error {
  status: number;
  statusCode: string;
  data?: unknown;

  constructor(statusCode: string, message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'APIResponseError';
    this.statusCode = statusCode;
    this.status = status;
    this.data = data;

    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, APIResponseError.prototype);

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIResponseError);
    }
  }

  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    };
  }
}

/**
 * API Request options
 */
export interface RequestOptions {
  auth?: boolean; // Whether to include authentication token
  timeout?: number; // Request timeout in milliseconds (default: 30000)
  headers?: HeadersInit; // Additional headers
  cache?: RequestCache; // Next.js cache strategy
  next?: NextFetchRequestConfig; // Next.js specific options
  params?: RequestHTTPQuery; // URL query parameters
  signal?: AbortSignal; // Abort signal for cancellation
  contentType?: 'json' | 'form-urlencoded'; // Content type for request body (default: 'json')
}

/**
 * Next.js specific fetch config
 */
type NextFetchRequestConfig = {
  revalidate?: number;
  tags?: string[];
};

/**
 * HTTP Query parameters type
 */
type RequestHTTPQuery = {
  [key: string]:
    | string
    | number
    | undefined
    | null
    | boolean
    | Array<string | number | null | undefined | boolean>
    | RequestHTTPQuery;
};

/**
 * Get base URL from environment
 */
function getBaseURL(): string {
  return apiURL; // Use apiURL which includes /api/v1/ prefix
}

/**
 * Get timeout duration from environment or use default
 */
function getTimeout(): number {
  return API_TIMEOUT;
}

/**
 * Get authentication token from NextAuth session with enhanced validation
 * Retrieves the access token from the server-side session
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Import auth dynamically to avoid circular dependencies
    const { auth } = await import('@/lib/auth');
    const session = await auth();

    const accessToken = session?.accessToken;

    if (!accessToken) {
      console.log('[API] No access token found in session');
      return null;
    }

    // Log token info in development for debugging
    if (process.env.NODE_ENV === 'development') {
      logTokenInfo(accessToken, 'API Access Token');
    }

    // Check if token needs refresh (this is a backup to NextAuth's automatic refresh)
    if (shouldRefreshToken(accessToken)) {
      console.log('[API] Token needs refresh, but NextAuth should handle this automatically');
      // Note: We don't handle refresh here - NextAuth JWT callback handles it
      // This is just for logging/debugging purposes
    }

    return accessToken;
  } catch (error) {
    console.error('[API] Failed to get auth token:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error?.constructor?.name,
    });
    return null;
  }
}

/**
 * Build full URL with base URL and enhanced query params handling
 */
function buildURL(endpoint: string, params?: RequestHTTPQuery): string {
  const baseURL = getBaseURL();

  // If endpoint is already a full URL, return as-is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Ensure base URL doesn't end with slash
  const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  let url = `${cleanBaseURL}/${cleanEndpoint}`;

  // Add query parameters using query-string library with enhanced options
  if (params && Object.keys(params).length > 0) {
    const queryString = querystring.stringify(params, {
      arrayFormat: 'bracket', // Better array handling: filter[key][]=value1&filter[key][]=value2
      skipNull: true, // Skip null values
      skipEmptyString: true, // Skip empty strings
    });

    url += `?${queryString}`;
  }

  return url;
}

/**
 * Build headers for request
 */
async function buildHeaders(options: RequestOptions = {}, body?: unknown): Promise<HeadersInit> {
  const headers = new Headers({
    ...(options.headers || {}),
  });

  // Set Content-Type based on options and body type
  if (!(body instanceof FormData)) {
    const contentType = options.contentType || 'json';
    if (contentType === 'form-urlencoded') {
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
    } else {
      headers.append('Content-Type', 'application/json');
    }
  }

  // Add authentication token if required
  if (options.auth) {
    const token = await getAuthToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
  }

  // Add X-API-Key header if configured
  if (xApiKey) {
    headers.append('x-api-key', xApiKey);
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Handle 204 No Content (common for DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  // Get content type
  const contentType = response.headers.get('Content-Type');
  let data: unknown;

  // Parse response based on content type
  if (contentType?.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      console.error('[API] Response cannot parse to JSON:', error);
      throw new APIResponseError(
        'PARSE_ERROR',
        `Response cannot parse to JSON: ${response.statusText}`,
        response.status
      );
    }
  } else {
    // Handle non-JSON responses (text, blob, etc.)
    const text = await response.text();
    data = text;
  }

  // Handle error responses
  if (!response.ok) {
    const errorCode =
      typeof data === 'object' && data !== null && 'code' in data
        ? String((data as { code: string }).code)
        : 'INTERNAL_SERVER_ERROR';

    const errorMessage =
      typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message: string }).message
        : `HTTP Error ${response.status}: ${response.statusText}`;

    throw new APIResponseError(errorCode, errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * Core fetch function with timeout and error handling
 */
async function fetchBase<T>(
  url: string,
  method: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const timeout = options.timeout || getTimeout();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Build full URL with query params
    const fullURL = buildURL(url, options.params);

    console.log(`[API] ${method} ${fullURL}`);

    // Build headers (now async to support NextAuth session)
    const headers = await buildHeaders(options, body);

    // Prepare request body based on content type
    let requestBody: BodyInit | undefined;
    if (body instanceof FormData) {
      requestBody = body;
    } else if (body !== undefined) {
      if (options.contentType === 'form-urlencoded') {
        // Encode as URL-encoded form data
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        }
        requestBody = params.toString();
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    // Make request with credentials to include cookies (for NextAuth session)
    const response = await fetch(fullURL, {
      method,
      headers,
      body: requestBody,
      signal: options.signal || controller.signal,
      cache: options.cache,
      next: options.next,
      credentials: 'include', // Important: Include cookies for NextAuth session
    });

    return await handleResponse<T>(response);
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIResponseError('TIMEOUT', 'Request timeout after 30 seconds', 408);
    }
    // Log and re-throw other errors
    if (error instanceof Error) {
      console.error('[API] Fetch error:', {
        url,
        method,
        error: error.message,
        cause: (error as any).cause || 'unknown',
      });
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return fetchBase<T>(endpoint, 'GET', undefined, options);
}

/**
 * POST request
 */
export async function post<T, U = unknown>(
  endpoint: string,
  body?: U,
  options: RequestOptions = {}
): Promise<T> {
  return fetchBase<T>(endpoint, 'POST', body, options);
}

/**
 * PUT request
 */
export async function put<T, U = unknown>(
  endpoint: string,
  body?: U,
  options: RequestOptions = {}
): Promise<T> {
  return fetchBase<T>(endpoint, 'PUT', body, options);
}

/**
 * PATCH request
 */
export async function patch<T, U = unknown>(
  endpoint: string,
  body?: U,
  options: RequestOptions = {}
): Promise<T> {
  return fetchBase<T>(endpoint, 'PATCH', body, options);
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return fetchBase<T>(endpoint, 'DELETE', undefined, options);
}

/**
 * Download blob (for file downloads)
 */
export async function downloadBlob(endpoint: string, options: RequestOptions = {}): Promise<Blob> {
  const timeout = options.timeout || getTimeout();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fullURL = buildURL(endpoint, options.params);
    const headers = await buildHeaders(options);

    const response = await fetch(fullURL, {
      method: 'GET',
      headers,
      signal: options.signal || controller.signal,
      cache: options.cache,
      next: options.next,
      credentials: 'include', // Include cookies for NextAuth session
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const errorMessage =
        typeof errorData === 'object' && errorData !== null && 'message' in errorData
          ? (errorData as { message: string }).message
          : `HTTP Error ${response.status}`;

      throw new APIResponseError('DOWNLOAD_ERROR', errorMessage, response.status, errorData);
    }

    return response.blob();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIResponseError('TIMEOUT', 'Download timeout after 30 seconds', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
