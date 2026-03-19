'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    FileText,
    Shield,
    Download,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    Archive,
    History,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function CompanyPoliciesPage() {
    const { isDarkMode } = useTheme();
    const [policies, setPolicies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/compliance/policies', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(r => r.json()).catch(() => ({ success: false }));

            if (res.success) {
                setPolicies(res.data || []);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const categories = ['Security', 'IT', 'HR', 'Legal', 'Operations'];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Draft': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Archived': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const filtered = policies.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                            <Shield className="h-6 w-6" />
                        </div>
                        Company Policies
                    </h1>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Central repository for all organization governance and compliance documentation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Policy
                    </Button>
                </div>
            </div>

            {/* Quick Stats & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Filter Bar */}
                    <div className={`p-3 rounded-2xl border flex flex-col md:flex-row gap-3 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="relative flex-1 group">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isDarkMode ? 'text-slate-600 group-focus-within:text-indigo-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="Search policies by title or content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all ${isDarkMode
                                    ? 'bg-slate-800/30 border border-slate-700 text-white focus:border-indigo-500'
                                    : 'bg-slate-50 border border-slate-100 focus:border-indigo-500'}`}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                            >
                                All Types
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                                        ? 'bg-indigo-600 text-white'
                                        : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Policy List */}
                    <div className="grid grid-cols-1 gap-4">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className={`h-32 rounded-3xl border animate-pulse ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}></div>
                            ))
                        ) : filtered.map((policy) => (
                            <div key={policy.id} className={`group p-6 rounded-3xl border transition-all hover:shadow-2xl hover:scale-[1.01] ${isDarkMode
                                ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900'
                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-indigo-500/5'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors' : 'bg-slate-50 text-indigo-600'}`}>
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{policy.title}</h3>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusStyles(policy.status)}`}>
                                                    {policy.status}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-medium line-clamp-2 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {policy.description}
                                            </p>
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <Clock className="h-3 w-3" />
                                                    Updated {new Date(policy.updatedAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                                    <History className="h-3 w-3" />
                                                    v{policy.version}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className={`rounded-xl ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50'}`}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className={`rounded-xl ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50'}`}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - Compliance Overview */}
                <div className="space-y-6">
                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/50' : 'bg-slate-950 text-white'}`}>
                        <h2 className="text-xl font-black mb-6 tracking-tight">Compliance Health</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-60">
                                    <span>Audit Readiness</span>
                                    <span>94%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[94%] animate-shimmer"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Active</p>
                                    <p className="text-xl font-black text-emerald-400">12</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Due</p>
                                    <p className="text-xl font-black text-amber-400">2</p>
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-bold tracking-tight">
                                <Archive className="h-4 w-4 mr-2" />
                                Export Reports
                            </Button>
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <h3 className={`text-sm font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recent Reviews</h3>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Q1 Privacy Audit</p>
                                        <p className="text-[10px] text-slate-500 italic">Completed 2d ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
