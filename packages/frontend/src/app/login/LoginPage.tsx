'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LogIn, Lock, Mail, Shield, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { LoginUserModel } from '@adminvault/shared-models';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const req = new LoginUserModel(formData.email, formData.password);
            const user = await login(req);
            if (user) {
                AlertMessages.getSuccessMessage('Logged in successfully!');
                router.push('/dashboard');
            } else {
                AlertMessages.getErrorMessage('Login Failed: Unable to retrieve user details.');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error?.message || 'Invalid credentials');
        }
    }, [login, formData, router]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Gradient Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>

                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Branding */}
                    <div className="text-white space-y-8 hidden lg:block">
                        <div className="space-y-4 animate-slide-up">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                                <Sparkles className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-semibold text-blue-300">Enterprise Platform</span>
                            </div>

                            <h1 className="text-6xl font-bold leading-tight">
                                Welcome to<br />
                                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    AdminVault
                                </span>
                            </h1>

                            <p className="text-xl text-gray-400 leading-relaxed">
                                Secure, powerful, and intuitive admin management platform designed for modern enterprises.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 animate-slide-up animation-delay-200">
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-blue-400">99.9%</div>
                                <div className="text-sm text-gray-500">Uptime</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-indigo-400">10k+</div>
                                <div className="text-sm text-gray-500">Users</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-purple-400">24/7</div>
                                <div className="text-sm text-gray-500">Support</div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 pt-8 animate-slide-up animation-delay-400">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-blue-400" />
                                </div>
                                <span className="text-gray-300">Enterprise-grade security</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <Lock className="h-4 w-4 text-indigo-400" />
                                </div>
                                <span className="text-gray-300">End-to-end encryption</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-purple-400" />
                                </div>
                                <span className="text-gray-300">Real-time analytics</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl p-8 animate-fade-in">
                            {/* Mobile Logo */}
                            <div className="lg:hidden mb-8 text-center">
                                <div className="inline-flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-white">AdminVault</h1>
                                </div>
                            </div>

                            {/* Form Header */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                                <p className="text-gray-400">Access your admin dashboard</p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-300">
                                        Email
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="you@example.com"
                                            required
                                            disabled={isLoading}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-semibold text-gray-300">
                                            Password
                                        </label>
                                        <a href="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                            Forgot?
                                        </a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter your password"
                                            required
                                            disabled={isLoading}
                                            className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 group"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <span>Sign In</span>
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-gray-900/50 text-gray-500 font-medium">Or continue with</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => AlertMessages.getSuccessMessage('Google login coming soon!')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all group"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-300">Google</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => AlertMessages.getSuccessMessage('Microsoft login coming soon!')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all group"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 23 23">
                                        <path fill="#f35325" d="M1 1h10v10H1z" />
                                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-300">Microsoft</span>
                                </button>
                            </div>

                            {/* Sign Up */}
                            {/* <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    Don't have an account?{' '}
                                    <a href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                        Create account
                                    </a>
                                </p>
                            </div> */}
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-600">
                                © 2026 AdminVault. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
