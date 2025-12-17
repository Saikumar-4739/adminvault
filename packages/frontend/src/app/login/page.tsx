'use client'


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { Building2, ShieldCheck, BarChart3, Users, Zap, X } from 'lucide-react';

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
    const [requestDesc, setRequestDesc] = useState('');
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
            router.push('/dashboard');
        } catch (err: any) {
            toastError('Login Failed', err.message || 'Invalid credentials');
        }
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log(`Request sent to inolyse@gmail.com: Name: ${requestName}, Email: ${requestEmail}, Desc: ${requestDesc}`);

        success('Request Sent', 'Your access request has been sent to inolyse@gmail.com');
        setIsRequesting(false);
        setShowRequestModal(false);
        setRequestName('');
        setRequestEmail('');
        setRequestDesc('');
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
        <div className="min-h-screen flex bg-white font-sans text-slate-900">
            {/* Left Side - App Info (70%) */}
            <div className="hidden lg:flex w-[70%] bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.1]"></div>

                {/* Main Content */}
                <div className="relative z-10 max-w-2xl space-y-8">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-fade-in shadow-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></span>
                        <span className="text-xs font-medium text-indigo-100 tracking-wide uppercase">AdminVault System</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                        IT Admin <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 animate-gradient-x">Management.</span>
                    </h1>

                    <p className="text-lg text-indigo-200 max-w-lg leading-relaxed font-light mt-4">
                        AdminVault is an enterprise IT management platform for inventory control, employee requests, and system administration.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors group cursor-default w-full h-auto md:h-32">
                            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-200 group-hover:text-white group-hover:bg-indigo-500 transition-all">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Enterprise Security</h3>
                                <p className="text-indigo-200 text-sm leading-snug">Bank-grade encryption & compliance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors group cursor-default w-full h-auto md:h-32">
                            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-200 group-hover:text-white group-hover:bg-violet-500 transition-all">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Real-time Analytics</h3>
                                <p className="text-indigo-200 text-sm leading-snug">Data-driven decision making</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors group cursor-default w-full h-auto md:h-32">
                            <div className="p-3 rounded-xl bg-fuchsia-500/20 text-fuchsia-200 group-hover:text-white group-hover:bg-fuchsia-500 transition-all">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Global Teams</h3>
                                <p className="text-indigo-200 text-sm leading-snug">Seamless collaboration tools</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors group cursor-default w-full h-auto md:h-32">
                            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-200 group-hover:text-white group-hover:bg-emerald-500 transition-all">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">High Performance</h3>
                                <p className="text-indigo-200 text-sm leading-snug">Optimized for speed & scale</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (30%) */}
            <div className="w-full lg:w-[30%] flex flex-col justify-center px-8 sm:px-12 bg-white relative z-20 shadow-2xl">
                <div className="w-full max-w-sm mx-auto space-y-10">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="mb-8 p-3 bg-primary-50 w-fit rounded-xl border border-primary-100">
                            <Building2 className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500">Please enter your credentials to access the vault.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-transparent border-slate-200 focus:border-primary-500 focus:ring-primary-500/10 rounded-lg h-12 transition-all"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-transparent border-slate-200 focus:border-primary-500 focus:ring-primary-500/10 rounded-lg h-12 transition-all"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-sm text-slate-600 group-hover:text-primary-600 transition-colors">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-primary-500/20"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={() => setShowRequestModal(true)}
                            className="text-primary-600 font-semibold hover:underline"
                        >
                            Request access
                        </button>
                    </p>
                </div>
            </div>

            {/* Request Access Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Request Access</h3>
                            <p className="text-sm text-slate-500 mt-1">Submit your details to request an admin account.</p>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description / Reason</label>
                                <textarea
                                    className="w-full rounded-lg border-slate-200 focus:border-primary-500 focus:ring-primary-500/10 min-h-[100px] text-sm py-2 px-3"
                                    value={requestDesc}
                                    onChange={(e) => setRequestDesc(e.target.value)}
                                    required

                                />
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
                            <p className="text-sm text-slate-500 mt-1">Enter your email to receive reset instructions.</p>
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
}
