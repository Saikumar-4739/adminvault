'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });
const TopBar = dynamic(() => import('./TopBar'), { ssr: false });

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
    // If loading, we show the layout shell (Sidebar + TopBar) and a loader in the main content.
    // This prevents the side nav from disappearing/refreshing on F5.

    if (!isLoading && !isAuthenticated) {
        return <>{children}</>;
    }

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
}
