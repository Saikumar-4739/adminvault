'use client';

import { usePathname } from 'next/navigation';
import { PageLoader } from '../ui/Spinner';
import { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AiAssistant } from '../ui/AiAssistant';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// Memoize the layout shell to prevent unnecessary re-renders
const LayoutShell = memo(function LayoutShell({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <TopBar />
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <PageLoader message="Loading content..." />
                    ) : (
                        children
                    )}
                </main>
                <AiAssistant />
            </div>
        </div>
    );
});

interface MainLayoutProps {
    children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    // Define public paths that shouldn't show the sidebar/topbar
    const isPublicPage = ['/login', '/register', '/forgot-password', '/'].includes(pathname || '');

    // If it's a public page, just render children without layout
    if (isPublicPage) {
        if (isLoading) {
            return (
                <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <PageLoader message="Initializing public access..." />
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
