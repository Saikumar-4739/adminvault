'use client'


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { Building2, ShieldCheck, BarChart3, Users, Zap, X } from 'lucide-react';
import { authService } from '@/lib/api/services';
import { RequestAccessModel } from '@adminvault/shared-models';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const { success, error: toastError } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    // const [error, setError] = useState(''); // Removed local error state in favor of Toast

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
        // setError(''); // Using toast instead

        try {
            if (rememberMe) {
                localStorage.setItem('remember_email', email);
            } else {
                localStorage.removeItem('remember_email');
            }

            await login({ email, password });
            router.push('/'); // Redirect to root to let page.tsx handle role-based routing
        } catch (err: any) {
            toastError('Login Failed', err.message || 'Invalid credentials');
        }
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        success('Reset Link Sent', `Password reset instructions sent to ${forgotEmail}`);
        setIsResetting(false);
        setShowForgotModal(false);
        setForgotEmail('');
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white">
            {/* Left Side - App Info (70%) */}
            <div className="hidden lg:flex w-[70%] bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.1]"></div>

                {/* Main Content */}
                <div className="relative z-10 max-w-2xl space-y-8">
                    {/* Large Prominent App Name */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl shadow-indigo-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse"></span>
                            <span className="text-xs font-semibold text-white tracking-widest uppercase">Enterprise Platform</span>
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-none">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x drop-shadow-2xl">
                                AdminVault
                            </span>
                        </h1>
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                        Secure. Scalable. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Managed</span>
                    </h2>

                    <p className="text-lg text-indigo-200 max-w-lg leading-relaxed font-light mt-4">
                        AdminVault is an enterprise IT management platform for inventory control, employee requests, and system administration.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-sm border border-indigo-400/20 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 group cursor-default w-full h-auto md:h-32">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/50 group-hover:shadow-indigo-500/70 group-hover:scale-110 transition-all duration-300">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 text-lg">Enterprise Security</h3>
                                <p className="text-indigo-200 text-sm leading-snug">Bank-grade encryption & compliance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 backdrop-blur-sm border border-violet-400/20 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 group cursor-default w-full h-auto md:h-32">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/50 group-hover:shadow-violet-500/70 group-hover:scale-110 transition-all duration-300">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 text-lg">Real-time Analytics</h3>
                                <p className="text-violet-200 text-sm leading-snug">Data-driven decision making</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-600/5 backdrop-blur-sm border border-fuchsia-400/20 hover:border-fuchsia-400/40 hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300 group cursor-default w-full h-auto md:h-32">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/50 group-hover:shadow-fuchsia-500/70 group-hover:scale-110 transition-all duration-300">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 text-lg">Global Teams</h3>
                                <p className="text-fuchsia-200 text-sm leading-snug">Seamless collaboration tools</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm border border-emerald-400/20 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 group cursor-default w-full h-auto md:h-32">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50 group-hover:shadow-emerald-500/70 group-hover:scale-110 transition-all duration-300">
                                <Zap className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1 text-lg">High Performance</h3>
                                <p className="text-emerald-200 text-sm leading-snug">Optimized for speed & scale</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (30%) */}
            <div className="w-full lg:w-[30%] flex flex-col justify-center px-8 sm:px-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 relative z-20 shadow-2xl border-l border-slate-200/50 dark:border-slate-800">
                <div className="w-full max-w-sm mx-auto space-y-10">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="mb-6 p-4 bg-gradient-to-br from-indigo-600 to-purple-600 w-fit rounded-2xl shadow-xl shadow-indigo-500/30 ring-1 ring-white/10">
                            <Building2 className="w-9 h-9 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">back</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-base font-medium">Enter your credentials to access the vault</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <Input
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/80 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 rounded-xl h-14 transition-all dark:text-white font-medium shadow-sm hover:shadow-md"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/80 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 rounded-xl h-14 transition-all dark:text-white font-medium shadow-sm hover:shadow-md"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] text-base"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 text-slate-500 dark:text-slate-400 font-medium">Need access?</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setShowRequestModal(true)}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-bold hover:from-indigo-700 hover:to-purple-700 transition-all"
                        >
                            Request access →
                        </button>
                    </p>
                </div>
            </div>

            {/* Request Access Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request Access</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit your details to request an admin account.</p>
                        </div>

                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={requestName}
                                onChange={(e) => setRequestName(e.target.value)}
                                required

                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={requestEmail}
                                onChange={(e) => setRequestEmail(e.target.value)}
                                required

                            />
                            <div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your email to receive reset instructions.</p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <Input
                                label="Email Address"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required

                            />

                            <Button
                                type="submit"
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
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

export default LoginPage;
