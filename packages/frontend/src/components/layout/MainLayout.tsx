'use client';

import { usePathname } from 'next/navigation';

import React, { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { LoadingScreen } from '../ui/LoadingScreen';
import { CommandPalette } from '../CommandPalette';


// Memoize the layout shell to prevent unnecessary re-renders
const LayoutShell = memo(function LayoutShell({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const toggleMobileMenu = React.useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const closeMobileMenu = React.useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                <TopBar onMenuClick={toggleMobileMenu} />
                <main className="flex-1 overflow-y-auto scrollbar-hide w-full">
                    {children}
                </main>
                <CommandPalette />
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

    // Normalize pathname to handle potential trailing slashes in production environments
    const normalizedPathname = (pathname || '').replace(/\/$/, '') || '/';
    const isPublicPage = ['/login', '/register', '/forgot-password', '/'].includes(normalizedPathname);

    // If it's a public page, just render children without layout
    if (isPublicPage) {
        return <>{children}</>;
    }

    // For protected pages:
    // Only render children without layout if user is confirmed to be NOT authenticated
    if (!isLoading && !isAuthenticated) {
        return <>{children}</>;
    }

    // Show layout shell for authenticated users OR while loading (to prevent flash)
    if (isLoading) {
        return <LoadingScreen message="Verifying access..." />;
    }

    return (
        <LayoutShell isLoading={isLoading}>
            {children}
        </LayoutShell>
    );
}
