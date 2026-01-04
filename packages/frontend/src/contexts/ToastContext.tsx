'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (toast: Omit<Toast, 'id'>) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        ({ type, title, message, duration = 5000 }: Omit<Toast, 'id'>) => {
            const id = Math.random().toString(36).substring(7);
            const toast: Toast = { id, type, title, message, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    const success = useCallback(
        (title: string, message?: string) => showToast({ type: 'success', title, message }),
        [showToast]
    );

    const error = useCallback(
        (title: string, message?: string) => showToast({ type: 'error', title, message }),
        [showToast]
    );

    const warning = useCallback(
        (title: string, message?: string) => showToast({ type: 'warning', title, message }),
        [showToast]
    );

    const info = useCallback(
        (title: string, message?: string) => showToast({ type: 'info', title, message }),
        [showToast]
    );

    const contextValue = React.useMemo(
        () => ({ showToast, success, error, warning, info }),
        [showToast, success, error, warning, info]
    );

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {mounted &&
                createPortal(
                    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
                        {toasts.map((toast) => (
                            <div key={toast.id} className="pointer-events-auto">
                                <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: <CheckCircle className="h-6 w-6" />,
        error: <AlertCircle className="h-6 w-6" />,
        warning: <AlertTriangle className="h-6 w-6" />,
        info: <Info className="h-6 w-6" />,
    };

    const styles = {
        success: 'bg-white dark:bg-slate-800 border-green-500 dark:border-green-600',
        error: 'bg-white dark:bg-slate-800 border-red-500 dark:border-red-600',
        warning: 'bg-white dark:bg-slate-800 border-amber-500 dark:border-amber-600',
        info: 'bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-600',
    };

    const iconColors = {
        success: 'text-green-600 dark:text-green-400',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-amber-600 dark:text-amber-400',
        info: 'text-blue-600 dark:text-blue-400',
    };

    const textColors = {
        success: 'text-green-900 dark:text-green-100',
        error: 'text-red-900 dark:text-red-100',
        warning: 'text-amber-900 dark:text-amber-100',
        info: 'text-blue-900 dark:text-blue-100',
    };

    return (
        <div
            className={cn(
                'flex items-start gap-4 p-4 pr-3 rounded-xl border-l-4 shadow-2xl animate-slide-down transform transition-all duration-300 hover:scale-105',
                styles[toast.type],
                textColors[toast.type]
            )}
        >
            <div className={cn('flex-shrink-0 mt-0.5', iconColors[toast.type])}>{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-base">{toast.title}</p>
                {toast.message && <p className="text-sm mt-1 opacity-80">{toast.message}</p>}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Close"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
