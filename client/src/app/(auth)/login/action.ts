'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { LoginRequest } from '@/schemas';
import { ROUTES } from '@/constants';
import { APIResponseError, post } from '@/services/api/base';
import { API_ROUTES } from '@/services/api/route';
import { logger } from '@/lib/logging';
import { ActionResponse } from '@/types';

interface AuthTokenResponse {
    access_token: string;
    access_token_expires: string;
    refresh_token: string;
    refresh_token_expires: string;
    user_info: {
        id: string;
        username: string;
        email: string;
        title_name: string;
        first_name: string;
        last_name: string;
        status: string;
        last_login_date: string;
    };
    access_token_expires_in: number;
}

/**
 * Admin login action using NextAuth
 * Authenticates admin user and creates a session
 * Pattern: Call API first to get tokens, then pass to NextAuth (like mt-exchange-rate)
 */
export async function loginAction(credentials: LoginRequest): Promise<ActionResponse> {
    try {
        logger.info('Login attempt started', {
            username: credentials.username,
        });

        // Call API to get tokens
        const payload = {
            username: credentials.username,
            password: credentials.password,
        };

        logger.info('Calling login API', {
            endpoint: API_ROUTES.LOGIN,
            username: credentials.username,
        });

        const authData = await post<AuthTokenResponse>(API_ROUTES.LOGIN, payload, {
            auth: false,
            contentType: 'form-urlencoded',
        });


        const result = await signIn('credentials', {
            access: authData.access_token,
            refresh: authData.refresh_token,
            username: authData.user_info.username,
            email: authData.user_info.email,
            firstName: authData.user_info.first_name,
            lastName: authData.user_info.last_name,
            titleName: authData.user_info.title_name,
            userId: authData.user_info.id,
            status: authData.user_info.status,
            redirect: false,
        });

        // Check if sign in was successful
        if (result?.error) {
            logger.error('NextAuth sign in failed', new Error(result.error), {
                username: authData.user_info.username,
            });
            return {
                success: false,
                error: {
                    code: 'AUTH_FAILED',
                    message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
                },
            };
        }

        logger.info('Login successful', {
            username: authData.user_info.username,
            email: authData.user_info.email,
            redirectUrl: ROUTES.HOME,
        });

        return {
            success: true,
            data: {
                redirectUrl: ROUTES.HOME,
            },
        };
    } catch (error) {
        // Handle API errors with specific messages
        if (error instanceof APIResponseError) {
            const errorWithContext = Object.assign(new Error('Login API Error'), {
                status: error.status,
                statusCode: error.statusCode,
                originalMessage: error.message,
            });

            logger.error('Login failed - API error', errorWithContext, {
                username: credentials.username,
                status: error.status,
                statusCode: error.statusCode,
            });

            return {
                success: false,
                error: {
                    code: error.status,
                    message: error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
                },
            };
        }

        // Handle NextAuth errors
        if (error instanceof AuthError) {
            const errorWithContext = Object.assign(new Error('NextAuth Error'), {
                authErrorType: error.type,
            });

            logger.error('Login failed - NextAuth error', errorWithContext, {
                username: credentials.username,
                errorType: error.type,
            });

            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        success: false,
                        error: {
                            code: 'INVALID_CREDENTIALS',
                            message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
                        },
                    };
                default:
                    return {
                        success: false,
                        error: {
                            code: 'AUTH_ERROR',
                            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
                        },
                    };
            }
        }

        // Handle other errors
        const errorWithContext = error instanceof Error ? error : new Error('Unknown error');
        logger.error('Login failed - unknown error', errorWithContext, {
            username: credentials.username,
        });

        return {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
            },
        };
    }
}

/**
 * Logout action using NextAuth
 * Clears the user session
 */
export async function logoutAction(): Promise<ActionResponse> {
    try {
        logger.info('Logout attempt started');

        await signOut({
            redirect: false,
        });

        logger.info('Logout successful', {
            redirectUrl: ROUTES.LOGIN,
        });

        return {
            success: true,
            data: {
                redirectUrl: ROUTES.LOGIN,
            },
        };
    } catch (error) {
        const errorWithContext = error instanceof Error ? error : new Error('Logout failed');
        logger.error('Logout failed', errorWithContext);

        return {
            success: false,
            error: {
                code: 'LOGOUT_FAILED',
                message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการออกจากระบบ',
            },
        };
    }
}
