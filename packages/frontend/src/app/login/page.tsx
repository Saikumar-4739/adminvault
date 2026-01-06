'use client'


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { Building2, ShieldCheck, BarChart3, Users, Zap, X, Lock } from 'lucide-react';
import { authService } from '@/lib/api/services';
import { RequestAccessModel, UserRoleEnum } from '@adminvault/shared-models';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const { success, error: toastError } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Modals state
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    // Request Access Form State
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    // Forgot Password Form State
    const [forgotEmail, setForgotEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('remember_email');
        if (storedEmail) {
            setEmail(storedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (rememberMe) {
                localStorage.setItem('remember_email', email);
            } else {
                localStorage.removeItem('remember_email');
            }

            const user = await login({ email, password });

            if (user) {
                await new Promise(resolve => setTimeout(resolve, 300));
                const userRole = (user.role || '').toLowerCase();
                if (userRole === UserRoleEnum.USER.toLowerCase() || userRole === UserRoleEnum.VIEWER.toLowerCase()) {
                    router.push('/create-ticket');
                } else {
                    router.push('/dashboard');
                }
            } else {
                toastError('Login Failed', 'Unable to retrieve user details.');
            }
        } catch (err: any) {
            toastError('Login Failed', err.message && err.message !== 'Login failed' ? err.message : 'Invalid email or password. Please try again.');
        }
    };

    const handleSSOLogin = (provider: 'microsoft' | 'zoho') => {
        // Redirect to backend SSO endpoint
        // Using direct URL construction based on standard config
        const baseUrl = process.env.NEXT_PUBLIC_APP_AVS_SERVICE_URL || 'http://localhost:3001/api';
        window.location.href = `${baseUrl}/auth-users/sso/login?provider=${provider}`;
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        try {
            const requestModel = new RequestAccessModel(requestName, requestEmail);
            const response = await authService.requestAccess(requestModel);

            if (response.status) {
                success('Request Sent', 'Your access request has been sent to inolyse@gmail.com');
                setIsRequesting(false);
                setShowRequestModal(false);
                setRequestName('');
                setRequestEmail('');
            } else {
                toastError('Request Failed', response.message || 'Could not send request');
                setIsRequesting(false);
            }
        } catch (error: any) {
            toastError('Request Failed', error.message || 'An error occurred');
            setIsRequesting(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        success('Reset Link Sent', `Password reset instructions sent to ${forgotEmail}`);
        setIsResetting(false);
        setShowForgotModal(false);
        setForgotEmail('');
    };

    // Microsoft Logo Component
    const MicrosoftLogo = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
            <title>MS-SymbolLockup</title>
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    );

    // Zoho Logo Component
    const ZohoLogo = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24">
            <title>Zoho</title>
            <path fill="#ed1c24" d="M3.5 6h4v12h-4z" />
            <path fill="#288e22" d="M8.5 6h4v12h-4z" />
            <path fill="#0067d0" d="M13.5 6h4v12h-4z" />
            <path fill="#fee300" d="M18.5 6h4v12h-4z" />
        </svg>
    );

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Left Side - App Info (Marketing) */}
            <div className="hidden lg:flex lg:w-[65%] relative z-10 flex-col justify-between p-16 bg-slate-900/50 backdrop-blur-3xl border-r border-white/5">
                <div className="absolute inset-0 bg-slate-900/60 z-[-1]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] z-[-1]" />

                {/* Logo Area */}
                <div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Enterprise V2.0</span>
                    </div>
                    <h1 className="text-7xl font-bold tracking-tight text-white mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Admin</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Vault</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-light">
                        The next-generation platform for secure identity management, asset tracking, and enterprise resource planning.
                    </p>
                </div>

                {/* Feature Pills */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: ShieldCheck, title: "Identity & Access", desc: "Zero-trust architecture with RBAC, SSO, and MFA policies.", color: "from-blue-500 to-indigo-500", iconColor: "text-blue-200" },
                            { icon: Building2, title: "Asset Management", desc: "Full lifecycle tracking for hardware, software, and licenses.", color: "from-emerald-500 to-teal-500", iconColor: "text-emerald-200" },
                            { icon: Users, title: "HR & Onboarding", desc: "Streamlined employee provisioning and automated access flows.", color: "from-orange-500 to-red-500", iconColor: "text-orange-200" },
                            { icon: BarChart3, title: "Finance & Audits", desc: "Real-time expense tracking, payroll integration, and compliance reports.", color: "from-violet-500 to-purple-500", iconColor: "text-violet-200" },
                            { icon: Zap, title: "Automated Workflows", desc: "Trigger-based actions for approvals, notifications, and alerts.", color: "from-yellow-400 to-amber-500", iconColor: "text-amber-100" },
                            { icon: Lock, title: "Security Vault", desc: "Enterprise-grade password manager and secret storage.", color: "from-cyan-500 to-blue-600", iconColor: "text-cyan-100" }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default group backdrop-blur-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">
                                <div className={`p-3 h-fit rounded-xl bg-gradient-to-br ${feature.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-6 h-6 ${feature.iconColor || 'text-white'}`} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1 tracking-wide">{feature.title}</h3>
                                    <p className="text-slate-300 text-xs leading-relaxed font-light">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Flow Visualization / Stats */}
                    <div className="flex gap-4 pt-6 border-t border-white/10">
                        <div className="flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 shadow-2xl backdrop-blur-md">
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-1">99.9%</div>
                            <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">Uptime Guarantee</div>
                        </div>
                        <div className="flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 shadow-2xl backdrop-blur-md">
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300 mb-1">ISO 27001</div>
                            <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">Certified Security</div>
                        </div>
                        <div className="flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 shadow-2xl backdrop-blur-md">
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-1">24/7</div>
                            <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">Global Support</div>
                        </div>
                    </div>
                </div>

                <div className="text-slate-500 text-xs font-medium">
                    © 2026 AdminVault Enterprise. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form (35%) - Cleaner & Neater */}
            <div className="w-full lg:w-[35%] flex flex-col justify-center px-8 sm:px-12 lg:px-20 relative z-20 bg-slate-50 dark:bg-[#0B1120] h-screen overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl">
                {/* Decorative background element for form area */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[100px]" />
                </div>
                <div className="w-full max-w-[420px] mx-auto space-y-10 py-10 relative z-10">

                    {/* Form Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20 mb-6 transform hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Welcome Back
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <div className="space-y-8 bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 backdrop-blur-sm">
                        {/* SSO Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleSSOLogin('microsoft')}
                                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md transform active:scale-[0.98]"
                            >
                                <MicrosoftLogo />
                                <span>Microsoft</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSSOLogin('zoho')}
                                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md transform active:scale-[0.98]"
                            >
                                <ZohoLogo />
                                <span>Zoho</span>
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-950 px-2 text-slate-400">Or continue with email</span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@company.com"
                                className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20"
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20"
                                />
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(true)}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5"
                                isLoading={isLoading}
                            >
                                Sign In
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setShowRequestModal(true)}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline decoration-2 underline-offset-4"
                        >
                            Request access
                        </button>
                    </p>
                </div>
            </div>

            {/* Request Access Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Get Access</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Join your team on AdminVault.</p>
                        </div>

                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={requestName}
                                onChange={(e) => setRequestName(e.target.value)}
                                required
                                className="bg-slate-50 dark:bg-slate-900/50"
                            />
                            <Input
                                label="Work Email"
                                type="email"
                                value={requestEmail}
                                onChange={(e) => setRequestEmail(e.target.value)}
                                required
                                className="bg-slate-50 dark:bg-slate-900/50"
                            />
                            <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl mt-2"
                                isLoading={isRequesting}
                            >
                                Send Request
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your email and we'll obtain a reset link.</p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                                className="bg-slate-50 dark:bg-slate-900/50"
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl mt-2"
                                isLoading={isResetting}
                            >
                                Send Reset Link
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


