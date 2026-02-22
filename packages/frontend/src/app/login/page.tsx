'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, Shield, Eye, EyeOff, ArrowRight, Sparkles, Users, Moon, Sun, BookOpen, Package } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { LoginUserModel } from '@adminvault/shared-models';
import Link from 'next/link';
import { configVariables } from '@adminvault/shared-services';
import { useTheme } from '@/contexts/ThemeContext';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
        // Load saved email on mount
        const savedEmail = localStorage.getItem('last_login_email');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        }
    }, [isAuthenticated, router]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const req = new LoginUserModel(formData.email, formData.password);
            const user = await login(req);
            if (user) {
                // Save email for next time
                localStorage.setItem('last_login_email', formData.email);
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
        <div className={`min-h-screen relative flex items-center justify-center overflow-hidden transition-colors duration-700 ${isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900'
            : 'bg-[#F8FAFC]'
            }`}>
            {/* Theme Toggle Button */}
            <button
                onClick={toggleDarkMode}
                className={`absolute top-8 right-8 z-50 p-3 rounded-2xl backdrop-blur-xl border transition-all duration-500 group ${isDarkMode
                    ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
                    : 'bg-white shadow-lg shadow-slate-200/50 border-slate-200 hover:border-slate-300 hover:scale-105'
                    }`}
                aria-label="Toggle theme"
            >
                {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                    <Moon className="h-5 w-5 text-slate-600 group-hover:-rotate-12 transition-transform duration-500" />
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
                        {/* <div className="grid grid-cols-3 gap-4 pt-2 animate-slide-up animation-delay-200">
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
                        </div> */}

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2 animate-slide-up animation-delay-400">
                            {[
                                {
                                    icon: Package,
                                    title: 'Asset Inventory',
                                    desc: 'Track & manage company assets',
                                    darkContainer:
                                        'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40',
                                    lightContainerBorder:
                                        'hover:shadow-blue-500/10 hover:border-blue-200',
                                    darkIcon:
                                        'bg-gradient-to-br from-blue-500/30 to-cyan-500/30',
                                    lightIcon:
                                        'bg-blue-50 text-blue-600',
                                    darkIconColor:
                                        'text-cyan-300',
                                    hoverGradient:
                                        'from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10',
                                },
                                {
                                    icon: Users,
                                    title: 'Employee Info',
                                    desc: 'Centralized employee records',
                                    darkContainer:
                                        'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-400/40',
                                    lightContainerBorder:
                                        'hover:shadow-emerald-500/10 hover:border-emerald-200',
                                    darkIcon:
                                        'bg-gradient-to-br from-emerald-500/30 to-green-500/30',
                                    lightIcon:
                                        'bg-emerald-50 text-emerald-600',
                                    darkIconColor:
                                        'text-green-300',
                                    hoverGradient:
                                        'from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10',
                                },
                                {
                                    icon: Mail,
                                    title: 'Email Info',
                                    desc: 'Secure client communication',
                                    darkContainer:
                                        'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-400/40',
                                    lightContainerBorder:
                                        'hover:shadow-indigo-500/10 hover:border-indigo-200',
                                    darkIcon:
                                        'bg-gradient-to-br from-indigo-500/30 to-purple-500/30',
                                    lightIcon:
                                        'bg-indigo-50 text-indigo-600',
                                    darkIconColor:
                                        'text-purple-300',
                                    hoverGradient:
                                        'from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10',
                                },
                                {
                                    icon: BookOpen,
                                    title: 'Knowledge Base',
                                    desc: 'Docs, guides & internal help',
                                    darkContainer:
                                        'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-400/40',
                                    lightContainerBorder:
                                        'hover:shadow-violet-500/10 hover:border-violet-200',
                                    darkIcon:
                                        'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30',
                                    lightIcon:
                                        'bg-violet-50 text-violet-600',
                                    darkIconColor:
                                        'text-fuchsia-300',
                                    hoverGradient:
                                        'from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10',
                                },
                            ]
                                .map((feat, i) => (
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
                    <div className="w-full max-w-lg mx-auto lg:mx-0 animate-fade-in relative">

                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className={`absolute -inset-1 rounded-3xl blur-2xl transition-all duration-1000 ${isDarkMode
                                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-40 group-hover:opacity-60 group-hover:blur-3xl'
                                : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-20 group-hover:opacity-40 group-hover:blur-3xl'
                                }`}></div>

                            {/* Form Container */}
                            <div className={`relative backdrop-blur-3xl rounded-3xl p-8 lg:p-10 transition-all duration-700 border shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ${isDarkMode
                                ? 'bg-slate-900/90 border-slate-700/50'
                                : 'bg-white/95 border-white/50 shadow-blue-900/10'
                                }`}>
                                {/* Security Badge */}
                                <div className="flex justify-center mb-8">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest animate-glow ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        Secure Access Verified
                                    </div>
                                </div>
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
                                        }`}>Sign in to access your website</p>
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
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="you@company.com"
                                                required
                                                disabled={isLoading}
                                                className={`w-full pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 ${isDarkMode
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
                                            {/* <a href="/forgot-password" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                                Forgot?
                                            </a> */}
                                        </div>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Enter your password"
                                                required
                                                disabled={isLoading}
                                                className={`w-full pl-10 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 ${isDarkMode
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
                                        className="w-full py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 group/btn relative overflow-hidden text-lg uppercase tracking-tight"
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

                                    {/* <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className={`px-2 px-4 backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/50 text-gray-500' : 'bg-white text-gray-400'}`}>Or continue with</span>
                                        </div>
                                    </div> */}



                                    {/* Google Login Button */}
                                    {/* <Button
                                        type="button"
                                        onClick={() => window.location.href = `${configVariables.APP_AVS_SERVICE_URL}/auth-users/google`}
                                        className={`w-full py-4 flex items-center justify-center gap-3 rounded-xl border font-bold transition-all duration-300 ${isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Sign in with Google
                                    </Button> */}

                                    {/* Additional Links */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                                        <Link
                                            href="/request-access"
                                            className={`text-sm font-bold transition-all duration-300 flex items-center gap-2 group/link ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                        >
                                            <Users className="h-4 w-4 transition-transform group-hover/link:scale-110" />
                                            <span>Request Access</span>
                                        </Link>
                                        <Link
                                            href="/forgot-password"
                                            className={`text-sm font-bold transition-all duration-300 flex items-center gap-2 group/link ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                                        >
                                            <Lock className="h-4 w-4 transition-transform group-hover/link:scale-110" />
                                            <span>Password Reset</span>
                                        </Link>
                                    </div>
                                </form>

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