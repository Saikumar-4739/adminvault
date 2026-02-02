'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, Shield, Eye, EyeOff, ArrowRight, Sparkles, Zap, Users, CheckCircle2, TrendingUp, Moon, Sun } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { LoginUserModel } from '@adminvault/shared-models';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

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

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    return (
        <div className={`min-h-screen relative flex items-center justify-center overflow-hidden transition-colors duration-700 ${isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900'
            : 'bg-[#F8FAFC]'
            }`}>
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className={`absolute top-8 right-8 z-50 p-4 rounded-2xl backdrop-blur-xl border transition-all duration-500 group ${isDarkMode
                    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
                    : 'bg-white shadow-lg shadow-slate-200/50 border-slate-200 hover:border-slate-300 hover:scale-110'
                    }`}
                aria-label="Toggle theme"
            >
                {isDarkMode ? (
                    <Sun className="h-6 w-6 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                    <Moon className="h-6 w-6 text-slate-600 group-hover:-rotate-12 transition-transform duration-500" />
                )}
            </button>

            {/* Enhanced Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Vibrant Gradient Orbs - Adjusted for Light Mode */}
                <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float ${isDarkMode ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30' : 'bg-gradient-to-r from-blue-400/20 to-cyan-300/20 opacity-70'}`}></div>
                <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float-delayed ${isDarkMode ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30' : 'bg-gradient-to-r from-indigo-400/20 to-purple-300/20 opacity-70'}`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slow ${isDarkMode ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20' : 'bg-gradient-to-r from-violet-400/10 to-fuchsia-300/10 opacity-60'}`}></div>

                {/* Animated Grid */}
                <div className={`absolute inset-0 bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] ${isDarkMode
                    ? 'bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]'
                    : 'bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)]'
                    }`}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Enhanced Branding */}
                    <div className={`space-y-6 hidden lg:block transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                        <div className="space-y-6 animate-slide-up">
                            {/* Badge */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm animate-glow ${isDarkMode
                                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30'
                                : 'bg-white/80 border-blue-100 shadow-sm shadow-blue-500/10'
                                }`}>
                                <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                                <span className="text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Enterprise-Grade Platform</span>
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-7xl font-black leading-tight mb-4 tracking-tight">
                                    <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Welcome to</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent animate-gradient">
                                        AdminVault
                                    </span>
                                </h1>
                                <p className={`text-xl leading-relaxed max-w-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-500'}`}>
                                    The most advanced admin management platform. Secure, scalable, and built for the future.
                                </p>
                            </div>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-2 animate-slide-up animation-delay-200">
                            {[
                                {
                                    val: '99.9%',
                                    label: 'Uptime SLA',
                                    darkBg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
                                    lightBg: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
                                    darkBorder: 'border-blue-500/30 hover:border-blue-400/50',
                                    textGradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    val: '50k+',
                                    label: 'Active Users',
                                    darkBg: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
                                    lightBg: 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
                                    darkBorder: 'border-indigo-500/30 hover:border-indigo-400/50',
                                    textGradient: 'from-indigo-500 to-purple-500'
                                },
                                {
                                    val: '24/7',
                                    label: 'Support',
                                    darkBg: 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20',
                                    lightBg: 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10',
                                    darkBorder: 'border-violet-500/30 hover:border-violet-400/50',
                                    textGradient: 'from-violet-500 to-fuchsia-500'
                                }
                            ].map((stat, i) => (
                                <div key={i} className="relative group h-full">
                                    <div className={`absolute inset-0 rounded-xl blur-lg group-hover:blur-xl transition-all ${isDarkMode
                                        ? stat.darkBg
                                        : `${stat.lightBg} opacity-0 group-hover:opacity-100`
                                        }`}></div>
                                    <div className={`relative rounded-xl p-4 transition-all border h-full flex flex-col justify-center ${isDarkMode
                                        ? `bg-slate-900/50 backdrop-blur-sm ${stat.darkBorder}`
                                        : 'bg-white border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50'
                                        }`}>
                                        <div className={`text-4xl font-black bg-gradient-to-r ${stat.textGradient} bg-clip-text text-transparent`}>{stat.val}</div>
                                        <div className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2 animate-slide-up animation-delay-400">
                            {[
                                {
                                    icon: Shield,
                                    title: 'Enterprise Security',
                                    desc: 'MFA & RBAC protection',
                                    darkContainer: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40',
                                    lightContainerBorder: 'hover:shadow-blue-500/10 hover:border-blue-200',
                                    darkIcon: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30',
                                    lightIcon: 'bg-blue-50 text-blue-600',
                                    darkIconColor: 'text-cyan-300',
                                    hoverGradient: 'from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10'
                                },
                                {
                                    icon: Lock,
                                    title: 'Data Encryption',
                                    desc: 'End-to-end AES-256',
                                    darkContainer: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-400/40',
                                    lightContainerBorder: 'hover:shadow-indigo-500/10 hover:border-indigo-200',
                                    darkIcon: 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30',
                                    lightIcon: 'bg-indigo-50 text-indigo-600',
                                    darkIconColor: 'text-purple-300',
                                    hoverGradient: 'from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10'
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Real-time Analytics',
                                    desc: 'Live insights dashboard',
                                    darkContainer: 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-400/40',
                                    lightContainerBorder: 'hover:shadow-violet-500/10 hover:border-violet-200',
                                    darkIcon: 'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30',
                                    lightIcon: 'bg-violet-50 text-violet-600',
                                    darkIconColor: 'text-fuchsia-300',
                                    hoverGradient: 'from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10'
                                },
                                {
                                    icon: Zap,
                                    title: 'AI Automation',
                                    desc: 'Smart workflow engine',
                                    darkContainer: 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20 hover:border-cyan-400/40',
                                    lightContainerBorder: 'hover:shadow-cyan-500/10 hover:border-cyan-200',
                                    darkIcon: 'bg-gradient-to-br from-cyan-500/30 to-teal-500/30',
                                    lightIcon: 'bg-cyan-50 text-cyan-600',
                                    darkIconColor: 'text-teal-300',
                                    hoverGradient: 'from-cyan-500/0 to-teal-500/0 group-hover:from-cyan-500/10 group-hover:to-teal-500/10'
                                },
                                {
                                    icon: Users,
                                    title: 'Team Collaboration',
                                    desc: 'Unified workspace',
                                    darkContainer: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-400/40',
                                    lightContainerBorder: 'hover:shadow-emerald-500/10 hover:border-emerald-200',
                                    darkIcon: 'bg-gradient-to-br from-emerald-500/30 to-green-500/30',
                                    lightIcon: 'bg-emerald-50 text-emerald-600',
                                    darkIconColor: 'text-green-300',
                                    hoverGradient: 'from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10'
                                },
                                {
                                    icon: CheckCircle2,
                                    title: 'Compliance Ready',
                                    desc: 'GDPR, SOC 2, ISO',
                                    darkContainer: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20 hover:border-rose-400/40',
                                    lightContainerBorder: 'hover:shadow-rose-500/10 hover:border-rose-200',
                                    darkIcon: 'bg-gradient-to-br from-rose-500/30 to-pink-500/30',
                                    lightIcon: 'bg-rose-50 text-rose-600',
                                    darkIconColor: 'text-pink-300',
                                    hoverGradient: 'from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/10 group-hover:to-pink-500/10'
                                }
                            ].map((feat, i) => (
                                <div key={i} className={`group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-105 border h-full flex flex-col justify-center ${isDarkMode
                                    ? feat.darkContainer
                                    : `bg-white border-slate-100 shadow-sm hover:shadow-md ${feat.lightContainerBorder}`
                                    }`}>
                                    <div className={`absolute inset-0 transition-all bg-gradient-to-br ${isDarkMode
                                        ? feat.hoverGradient
                                        : 'opacity-0 group-hover:opacity-100 bg-slate-50/50'
                                        }`}></div>
                                    <div className="relative flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${isDarkMode
                                            ? feat.darkIcon
                                            : feat.lightIcon
                                            }`}>
                                            <feat.icon className={`h-5 w-5 ${isDarkMode ? feat.darkIconColor : 'text-current'}`} />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{feat.title}</h3>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{feat.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Enhanced Login Form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0 animate-fade-in">
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className={`absolute -inset-1 rounded-3xl blur-xl transition-all ${isDarkMode
                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-30 group-hover:opacity-50'
                                : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-20 group-hover:opacity-40'
                                }`}></div>

                            {/* Form Container */}
                            <div className={`relative backdrop-blur-2xl rounded-2xl p-8 transition-colors duration-700 border shadow-2xl ${isDarkMode
                                ? 'bg-slate-900/80 border-slate-700/50'
                                : 'bg-white border-white/50 shadow-blue-900/5'
                                }`}>
                                {/* Mobile Logo */}
                                <div className="lg:hidden mb-8 text-center">
                                    <div className="inline-flex items-center gap-3 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                                            <Shield className="h-7 w-7 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AdminVault</h1>
                                    </div>
                                </div>

                                {/* Form Header */}
                                <div className="mb-8">
                                    <h2 className={`text-3xl font-black mb-2 transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                        }`}>Welcome Back</h2>
                                    <p className={`transition-colors duration-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>Sign in to access your dashboard</p>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className={`block text-sm font-bold transition-colors duration-700 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                            }`}>
                                            Email Address
                                        </label>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="you@company.com"
                                                required
                                                disabled={isLoading}
                                                className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 ${isDarkMode
                                                    ? 'bg-slate-800/50 border border-slate-600 text-white placeholder-gray-500 hover:border-slate-500'
                                                    : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className={`block text-sm font-bold transition-colors duration-700 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                                }`}>
                                                Password
                                            </label>
                                            <a href="/forgot-password" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                                Forgot?
                                            </a>
                                        </div>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Enter your password"
                                                required
                                                disabled={isLoading}
                                                className={`w-full pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 ${isDarkMode
                                                    ? 'bg-slate-800/50 border border-slate-600 text-white placeholder-gray-500 hover:border-slate-500'
                                                    : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400'
                                                    }`}
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
                                        className="w-full py-4 mt-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 group/btn relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2 relative z-10">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 relative z-10">
                                                <span>Sign In</span>
                                                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </div>
                                        )}
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 text-gray-400 font-semibold">Or continue with</span>
                                    </div>
                                </div>

                                {/* Social Login */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => AlertMessages.getSuccessMessage('Google login coming soon!')}
                                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800/50 border border-slate-600 rounded-xl hover:bg-slate-800 hover:border-slate-500 hover:shadow-lg transition-all group/social"
                                    >
                                        <svg className="h-5 w-5 group-hover/social:scale-110 transition-transform" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                                        </svg>
                                        <span className="text-sm font-bold text-gray-200">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => AlertMessages.getSuccessMessage('Microsoft login coming soon!')}
                                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800/50 border border-slate-600 rounded-xl hover:bg-slate-800 hover:border-slate-500 hover:shadow-lg transition-all group/social"
                                    >
                                        <svg className="h-5 w-5 group-hover/social:scale-110 transition-transform" viewBox="0 0 23 23">
                                            <path fill="#f35325" d="M1 1h10v10H1z" />
                                            <path fill="#81bc06" d="M12 1h10v10H12z" />
                                            <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                            <path fill="#ffba08" d="M12 12h10v10H12z" />
                                        </svg>
                                        <span className="text-sm font-bold text-gray-200">Microsoft</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
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
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    50% {
                        transform: translateY(-20px) translateX(20px);
                    }
                }
                @keyframes float-delayed {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    50% {
                        transform: translateY(20px) translateX(-20px);
                    }
                }
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                @keyframes glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
                    }
                }
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 1s ease-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 10s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
                .animate-shimmer-delayed {
                    animation: shimmer 3s linear infinite 1.5s;
                }
                .animate-glow {
                    animation: glow 2s ease-in-out infinite;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;