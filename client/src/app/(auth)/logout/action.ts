'use server';

import { signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';
import { logger } from '@/lib/logging';

/**
 * Logout server action
 * Pattern: Same as mt-exchange-rate - simple signOut and redirect
 *
 * Note: Backend logout endpoint is NOT called here because:
 * 1. NextAuth JWT is the source of truth (not backend session)
 * 2. Tokens are in HTTP-only cookies (automatically cleared by signOut)
 * 3. If backend needs to invalidate tokens, it should be done in NextAuth callbacks
 */
export async function logoutAction() {
  try {
    logger.info('[Logout] User logout initiated');

    // Clear NextAuth session (this clears HTTP-only cookies)
    await signOut({
      redirect: false,
    });

    logger.info('[Logout] User logged out successfully');
  } catch (error) {
    logger.error('[Logout] Logout error', error as Error);
    throw error;
  } finally {
    // Always redirect to login, even if there's an error
    redirect(ROUTES.LOGIN);
  }
}
