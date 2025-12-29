'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ROUTES } from '@/constants';

export const dynamic = 'force-dynamic';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            // No token found, redirect to login
            router.push(ROUTES.LOGIN);
        } else {
            // User is authenticated, redirect to dashboard
            router.push(ROUTES.DASHBOARD.ROOT);
        }
    }, [router]);

    // Show loading state while checking authentication
    return <LoadingScreen message="กำลังตรวจสอบสิทธิ์..." />;
}
