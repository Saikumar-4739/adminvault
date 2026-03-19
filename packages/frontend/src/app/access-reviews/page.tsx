'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    UserCheck,
    Calendar,
    ChevronRight,
    Search,
    TrendingUp,
    Shield,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function AccessReviewsPage() {
    const { isDarkMode } = useTheme();
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/compliance/reviews', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(r => r.json()).catch(() => ({ success: false }));

            if (res.success) {
                setReviews(res.data || []);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'Open': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            case 'Overdue': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className={`text-2xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        Access Reviews
                    </h1>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Periodic certification of user permissions to ensure least-privilege security.
                    </p>
                </div>
                <Button
                    variant="primary"
                    className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Start New Review
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Avg Completion</p>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>82%</p>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[82%]" />
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-xl">
                            2
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Pending Reviews</p>
                            <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Items Due Soon</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xl">
                            156
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Users Reviewed</p>
                            <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>This Quarter</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Reviews List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className={`font-black tracking-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Ongoing Certifications</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search cycles..."
                                className={`pl-10 pr-4 py-2 rounded-xl text-xs outline-none border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-200'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className={`h-24 rounded-3xl border animate-pulse ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}></div>
                        ))
                    ) : reviews.map((review) => (
                        <div key={review.id} className={`p-6 rounded-3xl border transition-all hover:scale-[1.005] group ${isDarkMode
                            ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                            : 'bg-white border-slate-100 shadow-sm shadow-slate-200/50'}`}>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950 group-hover:text-emerald-600'} transition-colors`}>
                                            {review.reviewName}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-widest ${getStatusStyles(review.status)}`}>
                                            {review.status}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{review.description}</p>
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-xs font-bold">Due: {new Date(review.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Shield className="h-4 w-4" />
                                            <span className="text-xs font-bold tracking-tight">System Compliance</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 lg:min-w-[200px]">
                                    <div className="text-right space-y-2 w-full max-w-[150px]">
                                        <div className="flex justify-between text-[11px] font-black tracking-widest uppercase mb-1">
                                            <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>Progress</span>
                                            <span className={isDarkMode ? 'text-white' : 'text-slate-950'}>{review.completionPercent}%</span>
                                        </div>
                                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            <div
                                                className={`h-full transition-all duration-1000 ${review.status === 'Overdue' ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                                style={{ width: `${review.completionPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className={`rounded-xl h-10 px-4 text-xs font-bold transition-all border ${isDarkMode ? 'border-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' : 'border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                                    >
                                        Execute Review
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className={`p-8 rounded-3xl border text-center space-y-4 ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-2">
                    <Shield className="h-6 w-6" />
                </div>
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-indigo-950'}`}>Automated Certifications</h3>
                <p className={`text-sm font-medium max-w-lg mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-indigo-900/70'}`}>
                    Enable auto-reviews to trigger security certification cycles based on user role changes or scheduled compliance intervals.
                </p>
                <div className="pt-2">
                    <Button variant="outline" className={`rounded-xl font-bold ${isDarkMode ? 'border-slate-700 text-white' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-100'}`}>
                        Configure Automation
                    </Button>
                </div>
            </div>
        </div>
    );
}
