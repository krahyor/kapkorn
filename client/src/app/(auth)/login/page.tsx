'use client';

import { useState, lazy, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { loginSchema, type LoginFormData } from '@/schemas';
import { loginAction } from './action';
import { ROUTES } from '@/constants';
import { fadeIn, slideFromBottom } from '@/lib/animations';

export const dynamic = 'force-dynamic';



function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Check for session expiry or error messages
  const error = searchParams.get('error');
  const sessionExpired = error === 'SessionExpired';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data: LoginFormData) => {
    // Call login server action (using NextAuth)
    const result = await loginAction({
      username: data.username,
      password: data.password,
    });

    if (result.success) {
      // Show success toast
      toast.success('เข้าสู่ระบบสำเร็จ', {
        description: 'กำลังเปลี่ยนเส้นทางไปยังแดชบอร์ด...',
      });

      // Get return URL from query params or default to dashboard
      const returnUrl = searchParams.get('returnUrl') || ROUTES.HOME;

      // Redirect to return URL or dashboard
      // NextAuth handles session via cookies automatically
      router.push(returnUrl);
      router.refresh(); // Refresh to update session state
    } else {
      // Handle error
      toast.error('เข้าสู่ระบบไม่สำเร็จ', {
        description: result.error?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Admin Image */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#166EA8] to-[#0F4C75] lg:flex lg:w-1/2">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[#166EA8]/90" />

        {/* Admin Image */}
        <div className="absolute inset-0">
          <Image
            src="/admin-bg.jpg"
            alt="Admin panel"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#166EA8]/70 to-[#0F4C75]/70" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="bg-background flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="mb-8 flex justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/Logo-Primary.svg"
                alt="หมอไกล้บ้าน"
                width={120}
                height={120}
                className="h-32 w-32 object-contain"
              />
            </div>
          </motion.div>

          {/* Login Title */}
          <motion.h2
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="mb-6 flex justify-center font-bold"
            style={{
              color: '#166EA8',
              fontFamily: 'Sarabun',
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: '44px',
              letterSpacing: '0',
            }}
          >
            เข้าสู่ระบบ
          </motion.h2>

          {/* Session Expired Warning */}
          {sessionExpired && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-amber-800">
                  <strong>เซสชันหมดอายุ:</strong> กรุณาเข้าสู่ระบบอีกครั้ง
                </p>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form
            variants={slideFromBottom}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Username */}
            <div>
              <label htmlFor="username" className="text-foreground mb-2 block text-sm">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                {...register('username')}
                className={`h-14 rounded-xl px-4 text-base ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-foreground mb-2 block text-sm">
                Password
              </label>
              <PasswordInput
                id="password"
                placeholder="••••••••••••••••"
                {...register('password')}
                className="h-14 rounded-xl px-4 text-base"
                error={!!errors.password}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-end justify-end">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-[#166EA8] hover:text-[#0F4C75] hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register('acceptTerms')}
                  className="h-4 w-4 rounded border text-[#1E88E5] focus:ring-[#1E88E5]"
                />
                <span className="text-sm text-foreground">
                  ฉันรับทราบและยอมรับ{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                    className="text-[#1E88E5] hover:underline"
                  >
                    นโยบายความเป็นส่วนตัว
                  </button>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
              )}
            </div>

            <div className="w-full">
              {/* Login Button */}
              <AnimatedButton
                type="submit"
                disabled={!acceptTerms || isSubmitting}
                className="h-14 w-full rounded-xl bg-[#166EA8] text-base font-medium text-white hover:bg-[#0F4C75] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </AnimatedButton>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingScreen message="กำลังเตรียมหน้าเข้าสู่ระบบ..." />}>
      <LoginForm />
    </Suspense>
  );
}
