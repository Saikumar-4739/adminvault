'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Something went wrong!
            </h1>
            <p className="text-slate-500 max-w-md mb-8 text-sm font-medium">
                An unexpected error occurred in your secure workspace. Don't worry, your data is safe.
                Please try resetting the application state.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={() => reset()}
                    variant="primary"
                    leftIcon={<RefreshCcw className="w-4 h-4" />}
                >
                    Try Again
                </Button>
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant="outline"
                    leftIcon={<Home className="w-4 h-4" />}
                >
                    Back to Dashboard
                </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left overflow-auto max-w-2xl w-full">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 font-bold">Error Debugger</p>
                    <pre className="text-xs font-mono text-rose-500 whitespace-pre-wrap">
                        {error.message}
                    </pre>
                </div>
            )}
        </div>
    );
}
