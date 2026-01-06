'use client';

import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// Memoize the layout shell to prevent unnecessary re-renders
const LayoutShell = memo(function LayoutShell({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    // Define public paths that shouldn't show the sidebar/topbar
    const isPublicPage = ['/login', '/register', '/forgot-password', '/'].includes(pathname || '');

    // If it's a public page, just render children without layout
    if (isPublicPage) {
        if (isLoading) {
            return (
                <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }
        return <>{children}</>;
    }

    // For protected pages:
    // Only render children without layout if user is confirmed to be NOT authenticated
    if (!isLoading && !isAuthenticated) {
        return <>{children}</>;
    }

    // Show layout shell for authenticated users OR while loading (to prevent flash)
    return <LayoutShell isLoading={isLoading}>{children}</LayoutShell>;
}
