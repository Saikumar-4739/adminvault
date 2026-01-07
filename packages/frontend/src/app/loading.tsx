import React from 'react';

/**
 * Global Loading Component for Next.js App Router
 * Provides a smooth transition between pages
 */
export default function Loading() {
    return (
        <div className="flex-1 h-full w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm min-h-[400px]">
            <div className="relative flex items-center justify-center">
                {/* outer ring */}
                <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full animate-pulse"></div>
                {/* spinning ring */}
                <div className="absolute w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                {/* inner core */}
                <div className="absolute w-6 h-6 bg-indigo-500 rounded-full animate-pulse blur-sm"></div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse">
                    AdminVault
                </h3>
            </div>
        </div>
    );
}
