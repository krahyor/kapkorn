/**
 * Authentication Schemas
 * Zod validation schemas for admin authentication
 */

import { AdminRole } from '@/constants/common';
import { z } from 'zod';

/**
 * Login request schema - uses username instead of email
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'กรุณายอมรับข้อกำหนดและเงื่อนไข',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login request (without acceptTerms for API)
 */
export const loginRequestSchema = loginSchema.omit({ acceptTerms: true });

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/**
 * Admin user schema
 */
export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  name: z.string(),
  role: z.nativeEnum(AdminRole),
  permissions: z.array(z.string()),
  avatar: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

/**
 * Login response schema - matches API structure
 */
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: adminUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

/**
 * Refresh token request schema
 */
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

/**
 * Refresh token response schema
 */
export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
