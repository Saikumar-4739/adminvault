'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Define public paths that shouldn't show the sidebar/topbar
    const isPublicPage = ['/login', '/register', '/forgot-password', '/'].includes(pathname || '');

    // Allow the homepage ('/') to decide its own layout or be covered by this?
    // The homepage is just a loading spinner redirector. It doesn't need a sidebar.
    // So excluding it is fine.

    if (isPublicPage) {
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
