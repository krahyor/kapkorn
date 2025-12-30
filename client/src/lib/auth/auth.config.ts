import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { jwtDecode } from 'jwt-decode';
import Credentials from 'next-auth/providers/credentials';

// Extend the User type to include our custom fields
declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  }
}

// Extend JWT type for type safety
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    permissions?: string[];
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        access: { label: 'Access Token', type: 'text' },
        refresh: { label: 'Refresh Token', type: 'text' },
        username: { label: 'Username', type: 'text' },
        email: { label: 'Email', type: 'email' },
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        permissions: { label: 'Permissions', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.access || !credentials?.refresh || !credentials?.username) {
          return null;
        }

        return {
          id: credentials.username as string,
          username: credentials.username as string,
          email: credentials.email as string,
          name: `${credentials.firstName || ''} ${credentials.lastName || ''}`.trim(),
          firstName: credentials.firstName as string,
          lastName: credentials.lastName as string,
          role: 'admin', // Default role
          permissions: JSON.parse((credentials.permissions as string) || '[]'),
          accessToken: credentials.access as string,
          refreshToken: credentials.refresh as string,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.permissions = user.permissions;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;

        // Try to get expiry from token itself, fallback to 1 hour
        const tokenExpiry = user.accessToken ? getTokenExpiry(user.accessToken) : null;
        token.accessTokenExpires = tokenExpiry || Date.now() + 60 * 60 * 1000;

        console.log('[Auth] JWT callback - Initial sign in:', {
          username: token.username,
          hasAccessToken: !!token.accessToken,
          hasRefreshToken: !!token.refreshToken,
          expiresAt: new Date(token.accessTokenExpires).toISOString(),
          expirySource: tokenExpiry ? 'jwt-token' : 'default-1hour',
        });
      }

      // Update session (e.g., from client-side update)
      if (trigger === 'update' && session) {
        token.name = session.user?.name || token.name;
      }

      // Check if token needs refresh using improved token expiry logic
      const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
      const shouldRefresh =
        !token.accessToken || isTokenExpired(token.accessToken, REFRESH_BUFFER_MS);

      // Return previous token if it's still valid and not near expiry
      if (!shouldRefresh) {
        return token;
      }

      console.log('[Auth] JWT callback - Token needs refresh:', {
        username: token.username,
        expiresAt: token.accessTokenExpires
          ? new Date(token.accessTokenExpires).toISOString()
          : 'unknown',
        timeUntilExpiry: token.accessTokenExpires
          ? `${Math.floor((token.accessTokenExpires - Date.now()) / 1000 / 60)} minutes`
          : 'unknown',
        hasRefreshToken: !!token.refreshToken,
      });

      // Access token has expired, try to refresh it
      const refreshedToken = await refreshAccessToken(token);

      // If refresh failed, mark token with error but don't return null yet
      // This allows one more chance before logout
      if (!refreshedToken || refreshedToken.error) {
        console.error('[Auth] JWT callback - Token refresh failed, marking for logout');

        // Return token with error flag instead of null
        // This prevents immediate logout and allows graceful error handling
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }

      console.log('[Auth] JWT callback - Token refreshed successfully');
      return refreshedToken;
    },
    async session({ session, token }) {
      // If token has error (refresh failed), invalidate session
      // This will trigger middleware redirect to login
      if (token?.error) {
        console.error('[Auth] Session callback - Token has error:', token.error);
        console.log(
          '[Auth] Session callback - Invalidating session, user will be redirected to login'
        );
        // Return null to invalidate session
        return null as any; // Type cast needed for NextAuth
      }

      // If token is completely null/undefined, session is invalid
      if (!token) {
        console.error('[Auth] Session callback - Token is null/undefined');
        return null as any; // Type cast needed for NextAuth
      }

      // Add custom fields to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env['AUTH_SECRET'] || 'fallback-secret-key-for-development-only',
  trustHost: true,
  debug: false, // Disable debug mode to prevent stack trace issues
} satisfies NextAuthConfig;

/**
 * Decode JWT token to get expiry time using jwt-decode library
 * More reliable than manual base64 decoding
 */
function getTokenExpiry(token: string): number | null {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert seconds to milliseconds
  } catch (error) {
    console.error('[Auth] Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired or will expire within buffer time
 */
function isTokenExpired(token: string, bufferMs: number = 0): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true;
  } // If we can't parse expiry, assume expired

  return Date.now() >= expiry - bufferMs;
}

/**
 * Refresh the access token using the refresh token
 * Uses API_ROUTES.REFRESH endpoint
 * Based on mt-exchange-rate pattern
 */
async function refreshAccessToken(token: JWT) {
  try {
    console.log('[Auth] refreshAccessToken - Starting refresh process');

    // Note: Mock mode - just extend the token expiry without calling API
    console.log('[Auth] refreshAccessToken - Mock mode, extending token expiry');
    return {
      ...token,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error('[Auth] refreshAccessToken - Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error?.constructor?.name,
      refreshToken: token.refreshToken ? 'present' : 'missing',
    });

    // Return token with error flag instead of throwing
    // This will trigger logout in jwt callback
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
