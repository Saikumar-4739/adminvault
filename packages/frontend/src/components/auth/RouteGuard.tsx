'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserRoleEnum } from '@adminvault/shared-models';

interface RouteGuardProps {
    children: React.ReactNode;
    requiredRoles?: UserRoleEnum[];
    fallbackPath?: string;
}

export function RouteGuard({
    children,
    requiredRoles,
    fallbackPath = '/tickets'
}: RouteGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Check if user is authenticated
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            // If no specific roles required, allow access
            if (!requiredRoles || requiredRoles.length === 0) {
                setIsAuthorized(true);
                return;
            }

            // Check if user has required role
            const userRole = user?.role as UserRoleEnum;
            const hasPermission = requiredRoles.includes(userRole);

            if (!hasPermission) {
                router.push(fallbackPath);
                return;
            }

            setIsAuthorized(true);
        }
    }, [isLoading, isAuthenticated, user, requiredRoles, fallbackPath, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children until authorized
    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
