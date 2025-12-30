/**
 * JWT Token Utilities
 * Enhanced token management with better error handling and expiry checking
 * Inspired by MT Exchange Rate implementation with additional security features
 */

import { jwtDecode, JwtPayload } from 'jwt-decode';
import querystring from 'query-string';

/**
 * Enhanced JWT token interface
 */
export interface EnhancedJwtPayload extends JwtPayload {
  // Standard JWT claims
  sub?: string; // Subject (user ID)
  iss?: string; // Issuer
  aud?: string; // Audience
  iat?: number; // Issued at
  exp?: number; // Expiration time
  jti?: string; // JWT ID

  // Custom claims based on your API
  user_id?: string;
  username?: string;
  role?: string;
  permissions?: string[];
  token_type?: 'access' | 'refresh';
}

/**
 * Token information interface
 */
export interface TokenInfo {
  payload: EnhancedJwtPayload;
  isExpired: boolean;
  willExpireSoon: boolean;
  timeUntilExpiry: number; // in milliseconds
  timeToExpiryString: string; // human readable
}

/**
 * Token refresh configuration
 */
export const TOKEN_CONFIG = {
  // Refresh token 5 minutes before expiry
  REFRESH_BUFFER_MS: 5 * 60 * 1000,

  // Minimum valid time after refresh attempt to prevent refresh loops
  MIN_VALID_TIME_MS: 2 * 60 * 1000, // 2 minutes

  // Maximum age for refresh token
  MAX_REFRESH_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

/**
 * Decode JWT token with enhanced error handling
 */
export function decodeToken(token: string): EnhancedJwtPayload | null {
  try {
    return jwtDecode<EnhancedJwtPayload>(token);
  } catch (error) {
    console.error('[JWT Utils] Failed to decode token:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error?.constructor?.name,
    });
    return null;
  }
}

/**
 * Get token expiry timestamp in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token);
  return payload?.exp ? payload.exp * 1000 : null;
}

/**
 * Check if token is expired or will expire within buffer time
 */
export function isTokenExpired(token: string, bufferMs: number = 0): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true;
  } // If we can't parse expiry, assume expired

  return Date.now() >= expiry - bufferMs;
}

/**
 * Get comprehensive token information
 */
export function getTokenInfo(token: string): TokenInfo {
  const payload = decodeToken(token) || {};
  const expiry = payload.exp ? payload.exp * 1000 : null;
  const now = Date.now();

  const timeUntilExpiry = expiry ? Math.max(0, expiry - now) : 0;
  const isExpired = !expiry || now >= expiry;
  const willExpireSoon = !isExpired && timeUntilExpiry <= TOKEN_CONFIG.REFRESH_BUFFER_MS;

  // Convert to human readable format
  const minutes = Math.floor(timeUntilExpiry / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let timeToExpiryString = 'Expired';
  if (!isExpired) {
    if (days > 0) {
      timeToExpiryString = `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      timeToExpiryString = `${hours}h ${minutes % 60}m`;
    } else {
      timeToExpiryString = `${minutes}m`;
    }
  }

  return {
    payload,
    isExpired,
    willExpireSoon,
    timeUntilExpiry,
    timeToExpiryString,
  };
}

/**
 * Convert epoch timestamp to Date object with timezone offset handling
 * Compatible with both seconds and milliseconds
 */
export function epochToDate(epoch: number): Date {
  let _epoch = epoch;

  // Handle both seconds (Unix timestamp) and milliseconds
  if (_epoch < 10000000000) {
    _epoch *= 1000;
  }

  // Adjust for timezone offset to get local time
  _epoch = _epoch + new Date().getTimezoneOffset() * -60000;

  return new Date(_epoch);
}

/**
 * Validate token format and structure
 */
export function validateTokenFormat(token: string): { isValid: boolean; error?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Token is required and must be a string' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Invalid JWT format: must have 3 parts' };
  }

  try {
    const payload = decodeToken(token);
    if (!payload) {
      return { isValid: false, error: 'Failed to decode token payload' };
    }

    if (!payload.exp) {
      return { isValid: false, error: 'Token missing expiration claim (exp)' };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if refresh token is still valid for use
 */
export function isRefreshTokenValid(refreshToken: string): boolean {
  if (!refreshToken) {
    return false;
  }

  const info = getTokenInfo(refreshToken);

  // Refresh token should not be expired
  if (info.isExpired) {
    return false;
  }

  // Refresh token should have reasonable remaining validity
  return info.timeUntilExpiry >= TOKEN_CONFIG.MIN_VALID_TIME_MS;
}

/**
 * Generate token refresh request payload
 */
export function createRefreshPayload(refreshToken: string): string {
  return querystring.stringify(
    {
      refresh: refreshToken,
      grant_type: 'refresh_token',
    },
    {
      arrayFormat: 'bracket',
    }
  );
}

/**
 * Parse refresh token response
 */
export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
  expires_in?: number; // in seconds
  token_type?: string;
}

export function parseRefreshResponse(data: unknown): RefreshTokenResponse {
  const response = data as any;

  return {
    access: response.access || response.accessToken,
    refresh: response.refresh || response.refreshToken,
    expires_in: response.expires_in || response.expiresIn,
    token_type: response.token_type || response.tokenType || 'Bearer',
  };
}

/**
 * Check if token needs refresh
 */
export function shouldRefreshToken(accessToken?: string): boolean {
  if (!accessToken) {
    return true;
  }

  const info = getTokenInfo(accessToken);

  // Refresh if expired or will expire soon
  return info.isExpired || info.willExpireSoon;
}

/**
 * Enhanced error for token operations
 */
export class TokenError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error | unknown
  ) {
    super(message);
    this.name = 'TokenError';

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      originalError:
        this.originalError instanceof Error ? this.originalError.message : this.originalError,
    };
  }
}

/**
 * Safe token refresh wrapper with retry logic
 */
export async function safeTokenRefresh<T>(
  refreshFn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await refreshFn();

      // Validate refresh result if it contains tokens
      if (result && typeof result === 'object' && 'access' in result) {
        const access = (result as any).access;
        if (access && !validateTokenFormat(access).isValid) {
          throw new TokenError('Invalid access token from refresh', 'INVALID_REFRESH_RESULT');
        }
      }

      return result;
    } catch (error) {
      lastError = error;

      console.error(`[JWT Utils] Token refresh attempt ${attempt + 1} failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name,
      });

      // Don't retry on authentication errors
      if (
        error instanceof TokenError &&
        (error.code === 'INVALID_CREDENTIALS' || error.code === 'INVALID_REFRESH_RESULT')
      ) {
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  // All attempts failed
  if (lastError instanceof TokenError) {
    throw lastError;
  }

  throw new TokenError('Token refresh failed after retries', 'REFRESH_FAILED', lastError);
}

/**
 * Log token information for debugging
 */
export function logTokenInfo(token: string, context: string = 'Token'): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const info = getTokenInfo(token);
  const validation = validateTokenFormat(token);

  console.log(`[JWT Utils] ${context} Info:`, {
    isValid: validation.isValid,
    isExpired: info.isExpired,
    willExpireSoon: info.willExpireSoon,
    timeToExpiry: info.timeToExpiryString,
    payload: {
      sub: info.payload.sub,
      user_id: info.payload.user_id,
      username: info.payload.username,
      role: info.payload.role,
      permissions: info.payload.permissions?.length || 0,
    },
    validationError: validation.error,
  });
}
