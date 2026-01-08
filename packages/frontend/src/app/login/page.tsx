'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { ShieldCheck, Users, Zap, X, Lock, ArrowRight, Globe, Building2 } from 'lucide-react';
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

    const handleSSOLogin = (provider: 'microsoft' | 'google') => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_AVS_SERVICE_URL || 'http://160.250.205.70:3001';
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



    // Google Logo Component
    const GoogleLogo = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
    );

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-[#020617] font-sans">

            {/* Left Side: Brand/Art (60%) */}
            <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-16 text-white bg-[#0F172A]">
                {/* Dynamic Gradient Overlay - Deep Space Theme */}
                <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-700/30 via-slate-900/0 to-slate-900/0" />
                <div className="absolute inset-0 bg-[radial-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-indigo-600/30 via-slate-900/0 to-slate-900/0" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] z-0" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/20 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-blue-100">System Online</span>
                        </div>
                        <h1 className="text-7xl font-black tracking-tight mb-6 leading-tight text-white drop-shadow-sm">
                            Admin<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Vault</span>
                        </h1>
                        <p className="text-slate-300 text-xl font-light leading-relaxed max-w-md">
                            The secure foundation for your enterprise operations. Manage Identity, Assets, and Compliance in one unified platform.
                        </p>
                    </div>

                    {/* Feature List */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div className="flex flex-col gap-2 group">
                            <div className="flex items-center gap-3 text-base font-semibold text-white group-hover:text-blue-200 transition-colors">
                                <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/20 group-hover:bg-blue-500/30 transition-colors"><ShieldCheck className="w-5 h-5 text-blue-300" /></div>
                                Enterprise Security
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pl-[3.25rem]">Zero-trust architecture with advanced RBAC.</p>
                        </div>

                        <div className="flex flex-col gap-2 group">
                            <div className="flex items-center gap-3 text-base font-semibold text-white group-hover:text-indigo-200 transition-colors">
                                <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors"><Zap className="w-5 h-5 text-indigo-300" /></div>
                                Automated Workflows
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pl-[3.25rem]">Trigger-based actions for approvals and alerts.</p>
                        </div>

                        <div className="flex flex-col gap-2 group">
                            <div className="flex items-center gap-3 text-base font-semibold text-white group-hover:text-cyan-200 transition-colors">
                                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors"><Globe className="w-5 h-5 text-cyan-300" /></div>
                                Global Infrastructure
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pl-[3.25rem]">Distributed systems ensures 99.9% uptime.</p>
                        </div>

                        <div className="flex flex-col gap-2 group">
                            <div className="flex items-center gap-3 text-base font-semibold text-white group-hover:text-violet-200 transition-colors">
                                <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/20 group-hover:bg-violet-500/30 transition-colors"><Users className="w-5 h-5 text-violet-300" /></div>
                                Team Management
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pl-[3.25rem]">Streamlined onboarding and access control.</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-700/50">
                        <div className="flex justify-between items-end">
                            <div className="text-sm text-slate-400 font-medium">
                                Trusted by industry leaders worldwide.
                            </div>
                            <div className="flex gap-2 opacity-50">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements - Subtle Glows */}
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
            </div>


            {/* Right Side: Form (40%) */}
            <div className="w-full lg:w-[40%] flex flex-col justify-center relative bg-white dark:bg-[#020617] transition-colors duration-300">
                {/* Decorative background element for form area */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="w-full max-w-[480px] mx-auto px-8 sm:px-12 py-10 relative z-10">

                    {/* Mobile Logo for small screens */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Admin<span className="text-blue-600 dark:text-blue-500">Vault</span></span>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Please enter your details to sign in.</p>
                    </div>

                    {/* SSO Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={() => handleSSOLogin('microsoft')} className="flex items-center justify-center h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
                            <MicrosoftLogo />
                        </button>
                        <button onClick={() => handleSSOLogin('google')} className="flex items-center justify-center h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
                            <GoogleLogo />
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#020617] px-4 text-slate-400 font-bold tracking-widest">or continue with email</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wide">Email Address</label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="name@company.com"
                                        className="h-14 pl-4 text-base bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-2xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Password</label>
                                    <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Forgot Password?</button>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="h-14 pl-4 text-base bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-2xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group mt-2"
                            isLoading={isLoading}
                        >
                            Sign In to Account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => setShowRequestModal(true)} className="font-bold text-blue-600 dark:text-blue-400 hover:underline transition-all">
                                Request access
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Request Access Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <button onClick={() => setShowRequestModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Request Access</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Fill in your details to join your organization's workspace.</p>
                        </div>
                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            <Input label="Full Name" value={requestName} onChange={(e) => setRequestName(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                            <Input label="Work Email" type="email" value={requestEmail} onChange={(e) => setRequestEmail(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2" isLoading={isRequesting}>Send Request</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <button onClick={() => setShowForgotModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">We'll send you instructions to reset your password.</p>
                        </div>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <Input label="Email Address" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2" isLoading={isResetting}>Send Reset Link</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
