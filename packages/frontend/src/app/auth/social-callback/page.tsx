'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SocialCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // We modify AuthContext manually, so no need for login method here
    // Actually AuthContext doesn't expose a 'setSession' method. 
    // But it reads from localStorage on mount.
    // If we set localStorage and then redirect, the AuthContext might not pick it up immediately unless we soft reload or if AuthContext listens to storage events (unlikely).
    // Better way: simply set localStorage and force a reload or rely on the dashboard route guard to pick it up if it re-checks.
    // AuthContext *only* checks on mount.

    // Changing strategy: We will use window.location.href to redirect to dashboard to ensure a full reload/re-mount of AuthProvider 
    // OR we can just set localStorage and push('/dashboard') assuming the dashboard layout wraps everything in AuthProvider which *should* re-render or we can't easily access setUser.

    // Let's modify AuthContext to expose `setSession` would be cleanest, but for now, full reload is safest and easiest.

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userInfoStr = searchParams.get('userInfo');

        if (token && userInfoStr) {
            try {
                const userInfo = JSON.parse(decodeURIComponent(userInfoStr));

                // Construct the user object as expected by AuthContext
                const user = {
                    id: userInfo.id ?? userInfo.companyId, // Fallback logic from AuthContext
                    fullName: userInfo.fullName,
                    email: userInfo.email,
                    companyId: userInfo.companyId,
                    role: userInfo.role
                };

                localStorage.setItem('auth_token', token);
                if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
                localStorage.setItem('auth_user', JSON.stringify(user));

                // Dispatch a custom event or just reload
                // Since AuthContext reads on mount, a full page load is robust.
                window.location.href = '/dashboard';
            } catch (err) {
                console.error('Failed to parse social login data', err);
                router.push('/login?error=social_login_failed');
            }
        } else {
            router.push('/login?error=social_login_failed');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Authenticating...</p>
            </div>
        </div>
    );
}
