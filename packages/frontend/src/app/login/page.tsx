'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, BrainCircuit, Activity, X, Users, Lock, LifeBuoy, BookOpen } from 'lucide-react';
import { authService } from '@/lib/api/services';
import { RequestAccessModel, UserRoleEnum, ForgotPasswordModel, LoginUserModel } from '@adminvault/shared-models';
import { AlertMessages } from '@/lib/utils/AlertMessages';

const LoginContent: React.FC = () => {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
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

            const req = new LoginUserModel(email, password);
            const user = await login(req);

            if (user) {
                await new Promise(resolve => setTimeout(resolve, 300));
                const userRole = (user.role || '').toLowerCase();
                if (userRole === UserRoleEnum.USER.toLowerCase() || userRole === UserRoleEnum.VIEWER.toLowerCase()) {
                    router.push('/create-ticket');
                } else {
                    router.push('/dashboard');
                }
            } else {
                AlertMessages.getErrorMessage('Login Failed: Unable to retrieve user details.');
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err?.message || 'Login failed');
        }
    };


    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        try {
            const req = new RequestAccessModel(requestName, requestEmail);
            const res = await authService.requestAccess(req);

            if (res.status) {
                AlertMessages.getSuccessMessage('Your access request has been sent to inolyse@gmail.com');
                setIsRequesting(false);
                setShowRequestModal(false);
                setRequestName('');
                setRequestEmail('');
            } else {
                AlertMessages.getErrorMessage(res.message || 'Could not send request');
                setIsRequesting(false);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'An error occurred');
            setIsRequesting(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetting(true);
        try {
            const req = new ForgotPasswordModel(forgotEmail);
            const res = await authService.forgotPassword(req);
            if (res.status) {
                AlertMessages.getSuccessMessage(res.message || `Password reset instructions sent to ${forgotEmail}`);
                setShowForgotModal(false);
                setForgotEmail('');
            } else {
                AlertMessages.getErrorMessage(res.message || 'Could not send reset link');
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message || 'An error occurred');
        } finally {
            setIsResetting(false);
        }
    };






    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-[#f8fafc] overflow-hidden font-sans selection:bg-blue-200">
            {/* Global Immersive Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Master Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(59,130,246,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(99,102,241,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.05),transparent_70%)]" />

                {/* Grid Effect */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

                {/* Dynamic Orbital Rings (Subtle for Light Mode) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[1600px] max-h-[1600px]">
                    <div className="absolute inset-0 border-[1px] border-blue-200 rounded-full animate-[spin_80s_linear_infinite]" />
                    <div className="absolute inset-[10%] border-[1px] border-indigo-100 rounded-full animate-[spin_60s_linear_infinite_reverse]" />
                </div>

                {/* Floating Soft Glows */}
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[1400px] h-full flex flex-col lg:flex-row items-center justify-between px-8 lg:px-20 py-12 gap-16">

                {/* Branding Side */}
                <div className="flex-1 flex flex-col justify-center text-left space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                            <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-600/80">AI Connect: System Synchronized</span>
                        </div>

                        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900">
                            Admin<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">Vault</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                        {[
                            { icon: LifeBuoy, title: "Support", desc: "Expert Assistance", color: "blue" },
                            { icon: BrainCircuit, title: "Assets", desc: "Predictive Synthesis", color: "indigo" },
                            { icon: BookOpen, title: "Knowledge", desc: "Cognitive Engine", color: "violet" }
                        ].map((m, idx) => (
                            <div key={idx} className="group p-5 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-md hover:bg-white/60 hover:border-white/80 transition-all duration-500 cursor-default shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl bg-${m.color}-500/10 text-${m.color}-600 group-hover:scale-110 group-hover:bg-${m.color}-500/20 transition-all`}>
                                        <m.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 group-hover:text-slate-950 transition-colors uppercase tracking-wider">{m.title}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium group-hover:text-slate-600 transition-colors">{m.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>


                {/* Login Card (Glassmorphic Interface - Light Edition) */}
                <div className="w-full lg:w-[480px] animate-in slide-in-from-right-12 duration-1000">
                    <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-white/80 to-slate-200 shadow-2xl overflow-hidden group">
                        <div className="relative bg-white/80 backdrop-blur-[40px] rounded-[31px] p-10 lg:p-12 border border-white/40">
                            <div className="mb-10 text-center lg:text-left">
                                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome</h2>
                                <p className="text-slate-500 text-sm font-medium">Initialize secure session to continue.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-5">
                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black text-blue-600/70 uppercase tracking-[0.2em] ml-1">Email ID</label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="identity@vault.security"
                                            className="h-14 px-5 text-sm bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all"
                                        />
                                    </div>
                                    <div className="group space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-blue-600/70 uppercase tracking-[0.2em]">Password</label>
                                            <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Forgot Password</button>
                                        </div>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="h-14 px-5 text-sm bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl transition-all"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-[0.1em] rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                                    isLoading={isLoading}
                                >
                                    Login
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </form>

                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]">
                                    <span className="bg-white/80 backdrop-blur-md px-4 text-slate-400">Sync with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-14 bg-white/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2"
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth-users/social/google`}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    GOOGLE
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-14 bg-white/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2"
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth-users/social/microsoft`}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                                        <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                                        <path fill="#f35325" d="M1 1h10v10H1z" />
                                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                                    </svg>
                                    MICROSOFT
                                </Button>
                            </div>

                            <div className="mt-10 text-center">
                                <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
                                    No access?{' '}
                                    <button type="button" onClick={() => setShowRequestModal(true)} className="text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-blue-600/20">
                                        Request Access
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Access Modal (Light Edition) */}
            {showRequestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[20px] animate-in fade-in duration-300">
                    <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-white to-slate-200 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
                        <div className="relative bg-white/90 backdrop-blur-3xl rounded-[31px] p-8 lg:p-10 border border-white/40">
                            <button onClick={() => setShowRequestModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mb-6">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Request Access</h3>
                                <p className="text-slate-500 mt-2 text-sm font-medium">Initialize uplink request to workspace.</p>
                            </div>
                            <form onSubmit={handleRequestAccess} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-600/70 uppercase tracking-[0.2em] ml-1">Identity Name</label>
                                    <Input value={requestName} onChange={(e) => setRequestName(e.target.value)} required className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 transition-all px-4" placeholder="Enter full name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-600/70 uppercase tracking-[0.2em] ml-1">Terminal Email</label>
                                    <Input type="email" value={requestEmail} onChange={(e) => setRequestEmail(e.target.value)} required className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 transition-all px-4" placeholder="name@company.com" />
                                </div>
                                <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl mt-4 shadow-lg shadow-blue-500/20 active:scale-95 transition-all" isLoading={isRequesting}>Send Uplink</Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal (Light Edition) */}
            {showForgotModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[20px] animate-in fade-in duration-300">
                    <div className="relative p-[1px] rounded-[32px] bg-gradient-to-b from-white to-slate-200 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
                        <div className="relative bg-white/90 backdrop-blur-3xl rounded-[31px] p-8 lg:p-10 border border-white/40">
                            <button onClick={() => setShowForgotModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center mb-6">
                                    <Lock className="w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Recovery Mode</h3>
                                <p className="text-slate-500 mt-2 text-sm font-medium">Verify credentials for secret key reset.</p>
                            </div>
                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-blue-600/70 uppercase tracking-[0.2em] ml-1">Terminal Email</label>
                                    <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/50 transition-all px-4" placeholder="name@company.com" />
                                </div>
                                <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl mt-4 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all" isLoading={isResetting}>Initialize Reset</Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
const LoginPage: React.FC = () => {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#020617]"></div>}>
            <LoginContent />
        </Suspense>
    );
}


export default LoginPage;