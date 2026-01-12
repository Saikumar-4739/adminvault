'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const showToast = useCallback(({ type, title, message, duration = 2000 }: Omit<Toast, 'id'>) => {
        const options: ToastOptions = {
            autoClose: duration,
            position: 'top-center',
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        };

        const content = renderContent(title, message);
        toast.dismiss(); // Dismiss any existing toasts before showing a new one

        switch (type) {
            case 'success':
                toast.success(content, options);
                break;
            case 'error':
                toast.error(content, options);
                break;
            case 'warning':
                toast.warn(content, options);
                break;
            case 'info':
                toast.info(content, options);
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
            <ToastContainer limit={1} />
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
