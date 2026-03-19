'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Globe,
    Mail,
    Plus,
    Search,
    Building2,
    ExternalLink,
    MoreVertical,
    Briefcase,
    AlertCircle,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function VendorManagementPage() {
    const { isDarkMode } = useTheme();
    const [vendors, setVendors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/organization/vendors', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }).then(r => r.json()).catch(() => ({ success: false }));

            if (res.success) {
                setVendors(res.data || []);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const categories = ['Software', 'Hardware', 'Services', 'Infrastructure', 'Legal'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Preferred': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Inactive': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const filtered = vendors.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-fade-in min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                        Vendor Management
                    </h1>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Track and manage external partnerships, service levels, and procurement contacts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Vendor
                    </Button>
                </div>
            </div>

            {/* Metrics & Filters Bar */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="relative flex-1 w-full group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isDarkMode ? 'text-slate-600 group-focus-within:text-blue-500' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="Search by vendor name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none transition-all ${isDarkMode
                            ? 'bg-slate-800/30 border border-slate-700 text-white focus:border-blue-500'
                            : 'bg-slate-50 border border-slate-100 focus:border-blue-500'}`}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                    {['all', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
                        >
                            {cat === 'all' ? 'All Vendors' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className={`h-64 rounded-3xl border animate-pulse ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}></div>
                    ))
                ) : filtered.map((vendor) => (
                    <div key={vendor.id} className={`group relative rounded-[2.5rem] border p-6 transition-all hover:shadow-2xl hover:scale-[1.01] ${isDarkMode
                        ? 'bg-slate-900/50 border-slate-800 hover:border-blue-500/30 hover:bg-slate-900'
                        : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-blue-500/5'}`}>

                        <div className="space-y-6">
                            {/* Vendor Head */}
                            <div className="flex items-start justify-between">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    {vendor.name.charAt(0)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(vendor.status)}`}>
                                        {vendor.status}
                                    </div>
                                    <button className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-50'}`}>
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2">
                                <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{vendor.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <Briefcase className="h-3 w-3" />
                                    {vendor.category}
                                    <span className="mx-1 opacity-20">•</span>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-2.5 w-2.5 ${i < vendor.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Card */}
                            <div className={`p-4 rounded-2xl space-y-3 ${isDarkMode ? 'bg-slate-950/30' : 'bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5 text-slate-500 border border-slate-800/10">
                                        <Mail className="h-3.5 w-3.5" />
                                    </div>
                                    <span className={`text-xs font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{vendor.contactEmail}</span>
                                </div>
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/link">
                                    <div className="p-2 rounded-lg bg-white/5 text-slate-500 border border-slate-800/10">
                                        <Globe className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-blue-500 group-hover/link:underline">{vendor.website?.replace('https://', '')}</span>
                                    <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                </a>
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/10">
                                <span className="text-[10px] font-bold text-slate-500">ID: {vendor.id.toString().padStart(4, '0')}</span>
                                <Button className={`h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    View Contracts
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State / Add Suggestion */}
            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex p-6 rounded-full bg-slate-900 border border-slate-800 mb-6">
                        <AlertCircle className="h-10 w-10 text-slate-700" />
                    </div>
                    <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Vendors Found</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        Try adjusting your search or filters to find the partnership you're looking for.
                    </p>
                    <Button variant="primary">Add New Strategic Vendor</Button>
                </div>
            )}
        </div>
    );
}
