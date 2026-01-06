'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toastError, success } = useToast();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
            console.error("SSO Error:", error);
            toastError('Login Failed', decodeURIComponent(error));
            setTimeout(() => router.push('/login'), 2000);
            return;
        }

        if (token && userStr) {
            try {
                // Decode user info
                const parsedUser = JSON.parse(decodeURIComponent(userStr));

                // Construct context-compatible user object
                // Ensure field mapping matches AuthContext expectations
                const contextUser = {
                    id: parsedUser.id || parsedUser.companyId,
                    fullName: parsedUser.fullName,
                    email: parsedUser.email,
                    companyId: parsedUser.companyId,
                    role: parsedUser.userRole || parsedUser.role
                };

                // Store in LocalStorage
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(contextUser));
                if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

                success('Login Successful', 'Authenticated via SSO. Redirecting...');

                // Use window.location to force full app reload/re-hydration of AuthContext
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);

            } catch (e: any) {
                console.error("SSO Processing Error:", e);
                toastError('Login Processing Error', 'Failed to process login data.');
                router.push('/login');
            }
        }
    }, [searchParams, router, toastError, success]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <h2 className="text-xl font-semibold">Completing Secure Login...</h2>
            <p className="text-slate-400 text-sm mt-2">Please wait while we redirect you.</p>
        </div>
    );
}

export default function SSOCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950"></div>}>
            <CallbackContent />
        </Suspense>
    );
}
