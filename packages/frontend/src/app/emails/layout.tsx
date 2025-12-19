'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function EmailsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <TopBar />
                <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-full h-full p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
