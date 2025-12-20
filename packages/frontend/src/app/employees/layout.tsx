'use client';

import Sidebar from '@/components/layout/Sidebar';

import TopBar from '@/components/layout/TopBar';

export default function EmployeesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-hidden">  {children}
                </main>
            </div>
        </div>
    );
}

