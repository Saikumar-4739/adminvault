'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    loginUser,
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError,
    selectIsLockedOut,
    selectLockoutTimeRemaining,
    selectLoginAttempts,
    clearError,
    resetLoginAttempts,
} from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LogIn, AlertCircle, Lock, Mail } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function LoginPageExample() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { success, error: toastError } = useToast();

    // Redux selectors
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectAuthLoading);
    const authError = useAppSelector(selectAuthError);
    const isLockedOut = useAppSelector(selectIsLockedOut);
    const lockoutTimeRemaining = useAppSelector(selectLockoutTimeRemaining);
    const loginAttempts = useAppSelector(selectLoginAttempts);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Handle lockout timer
    useEffect(() => {
        if (isLockedOut && lockoutTimeRemaining > 0) {
            const timer = setInterval(() => {
                // Timer will automatically update through selector
            }, 1000);

            return () => clearInterval(timer);
        }

        if (!isLockedOut && loginAttempts > 0) {
            // Reset attempts when lockout expires
            const timer = setTimeout(() => {
                dispatch(resetLoginAttempts());
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isLockedOut, lockoutTimeRemaining, loginAttempts, dispatch]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLockedOut) {
            toastError('Account Locked', `Too many failed attempts. Try again in ${Math.ceil(lockoutTimeRemaining / 60)} minutes.`);
            return;
        }

        try {
            const result = await dispatch(loginUser({
                email: formData.email,
                password: formData.password,
            })).unwrap();

            success('Success', 'Logged in successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toastError('Login Failed', error || 'Invalid credentials');
        }
    }, [dispatch, formData, isLockedOut, lockoutTimeRemaining, router, success, toastError]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const formatLockoutTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 ring-1 ring-white/10 mb-4">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to your account to continue</p>
                </div>

                {/* Login Form */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                    {/* Lockout Warning */}
                    {isLockedOut && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-200 text-sm">Account Temporarily Locked</h3>
                                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                        Too many failed login attempts. Please try again in {formatLockoutTime(lockoutTimeRemaining)}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Login Attempts Warning */}
                    {!isLockedOut && loginAttempts > 0 && loginAttempts < 5 && (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}.
                                        {5 - loginAttempts} attempt{5 - loginAttempts > 1 ? 's' : ''} remaining before lockout.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {authError && !isLockedOut && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{authError}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading || isLockedOut}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading || isLockedOut}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    disabled={isLoading || isLockedOut}
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                            </label>
                            <a href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3"
                            disabled={isLoading || isLockedOut}
                            leftIcon={isLoading ? undefined : <LogIn className="h-5 w-5" />}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Signing in...
                                </div>
                            ) : isLockedOut ? (
                                `Locked (${formatLockoutTime(lockoutTimeRemaining)})`
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-slate-400">
                    <p>© 2026 AdminVault. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
