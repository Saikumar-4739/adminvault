'use client';

import React, { createContext, useContext, useCallback } from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Maintaining the interface to prevent breaking changes in consumers
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

    // Helper to render the content with title and potential message
    const renderContent = (title: string, message?: string) => (
        <div className="flex flex-col">
            <span className="font-bold">{title}</span>
            {message && <span className="text-sm opacity-90 mt-1">{message}</span>}
        </div>
    );

    const showToast = useCallback(({ type, title, message, duration = 3000 }: Omit<Toast, 'id'>) => {
        const options: ToastOptions = {
            duration: duration,
            position: 'top-center',
        };

        const content = renderContent(title, message);
        toast.dismiss(); // Dismiss any existing toasts before showing a new one (imitating previous behavior limit={1})

        switch (type) {
            case 'success':
                toast.success(content, options);
                break;
            case 'error':
                toast.error(content, options);
                break;
            case 'warning':
                // react-hot-toast doesn't have a 'warn' method by default, reusing custom or using standard with icon
                toast(content, { ...options, icon: '⚠️' });
                break;
            case 'info':
                // react-hot-toast doesn't have 'info' by default, using standard with icon
                toast(content, { ...options, icon: 'ℹ️' });
                break;
            default:
                toast(content, options);
        }
    }, []);

    const success = useCallback((title: string, message?: string) => showToast({ type: 'success', title, message }), [showToast]);
    const error = useCallback((title: string, message?: string) => showToast({ type: 'error', title, message }), [showToast]);
    const warning = useCallback((title: string, message?: string) => showToast({ type: 'warning', title, message }), [showToast]);
    const info = useCallback((title: string, message?: string) => showToast({ type: 'info', title, message }), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    className: '',
                    style: {
                        background: '#1e293b', // slate-800
                        color: '#f8fafc', // slate-50
                        padding: '10px 24px', // Reduced vertical padding
                        borderRadius: '12px',
                        minWidth: '400px',
                        maxWidth: '600px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontSize: '15px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#f8fafc',
                        },
                    },
                    error: {
                        style: {
                            borderLeft: '4px solid #ef4444',
                        },
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#f8fafc',
                        },
                    },
                }}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
