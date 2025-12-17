'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Building2, ShieldCheck, BarChart3, Users, Zap } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login({ email, password });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900">
            {/* Left Side - App Info (70%) */}
            <div className="hidden lg:flex w-[65%] xl:w-[70%] bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 relative overflow-hidden items-center justify-center p-16">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.1]"></div>

                {/* Main Content */}
                <div className="relative z-10 max-w-2xl space-y-12">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-fade-in shadow-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></span>
                        <span className="text-xs font-medium text-indigo-100 tracking-wide uppercase">AdminVault System</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                        IT Admin <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 animate-gradient-x">Management.</span>
                    </h1>

                    <p className="text-lg text-indigo-200 max-w-lg leading-relaxed font-light mt-6">
                        <span className="font-medium text-white">Experience Control.</span> Securely manage your organization's assets, employees, and operations with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-cyan-200 font-medium">precision and ease.</span>
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
            <div className="w-full lg:w-[35%] xl:w-[30%] flex flex-col justify-center px-8 lg:px-12 xl:px-16 bg-white relative z-20">
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
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                <span className="text-sm text-slate-600 group-hover:text-primary-600 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">Forgot password?</a>
                        </div>

                        {/* {error && (
                            <div className="p-3 bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium rounded-lg">
                                {error}
                            </div>
                        )} */}

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
                        <a href="#" className="text-primary-600 font-semibold hover:underline">Request access</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
