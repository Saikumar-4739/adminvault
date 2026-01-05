'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });
const TopBar = dynamic(() => import('./TopBar'), { ssr: false });
import { useAuth } from '@/contexts/AuthContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    // Define public paths that shouldn't show the sidebar/topbar
    const isPublicPage = ['/login', '/register', '/forgot-password', '/'].includes(pathname || '');

    // While loading initial auth state, show nothing or a subtle loader to prevent flicker
    if (isLoading && !isPublicPage) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Hide dashboard shell if on public page OR if NOT authenticated
    if (isPublicPage || !isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
}
