'use client';

import { useState } from 'react';
import {
    Laptop, Monitor, Smartphone, Tablet, HardDrive,
    User, Calendar, Shield, Package, History,
    QrCode, Pencil, Trash2, ChevronDown, ChevronUp,
    AlertTriangle, CheckCircle2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AssetCardProps {
    asset: any;
    onEdit: (asset: any) => void;
    onDelete: (asset: any) => void;
    onQRCode: (asset: any) => void;
    onHistory: (asset: any) => void;
}

const getAssetIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laptop') || lowerName.includes('macbook')) return Laptop;
    if (lowerName.includes('monitor') || lowerName.includes('screen') || lowerName.includes('display')) return Monitor;
    if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('android')) return Smartphone;
    if (lowerName.includes('tablet') || lowerName.includes('ipad')) return Tablet;
    return HardDrive;
};

const getStatusConfig = (status: string) => {
    const statusUpper = status?.toUpperCase() || 'AVAILABLE';
    const configs: Record<string, { color: string; bg: string; gradient: string; icon: any }> = {
        'AVAILABLE': {
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            gradient: 'from-emerald-500/10 to-teal-500/10',
            icon: CheckCircle2
        },
        'IN_USE': {
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            gradient: 'from-blue-500/10 to-cyan-500/10',
            icon: User
        },
        'INUSE': {
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            gradient: 'from-blue-500/10 to-cyan-500/10',
            icon: User
        },
        'MAINTENANCE': {
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            gradient: 'from-amber-500/10 to-orange-500/10',
            icon: AlertTriangle
        },
        'RETIRED': {
            color: 'text-slate-600 dark:text-slate-400',
            bg: 'bg-slate-50 dark:bg-slate-800',
            gradient: 'from-slate-500/10 to-gray-500/10',
            icon: Package
        }
    };
    return configs[statusUpper] || configs['AVAILABLE'];
};

const isWarrantyExpiring = (warrantyDate?: string) => {
    if (!warrantyDate) return false;
    const expiry = new Date(warrantyDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
};

const isWarrantyExpired = (warrantyDate?: string) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
};

export default function AssetCard({ asset, onEdit, onDelete, onQRCode, onHistory }: AssetCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const AssetIcon = getAssetIcon(asset.assetName || 'Device');
    const statusConfig = getStatusConfig(asset.status);
    const StatusIcon = statusConfig.icon;
    const warrantyExpiring = isWarrantyExpiring(asset.warrantyExpiry);
    const warrantyExpired = isWarrantyExpired(asset.warrantyExpiry);

    return (
        <div className="group relative">
            {/* Solid Card */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">

                {/* Status Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${statusConfig.gradient.replace('/10', '')}`}></div>

                <div className="relative p-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Icon with Gradient Background */}
                            <div className={`relative p-2 rounded-lg bg-gradient-to-br ${statusConfig.gradient} border border-slate-200/50 dark:border-slate-700/50`}>
                                <AssetIcon className={`h-5 w-5 ${statusConfig.color}`} />
                                <div className="absolute -top-1 -right-1">
                                    <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                                </div>
                            </div>

                            {/* Asset Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base text-slate-900 dark:text-white truncate mb-0.5" title={asset.assetName}>
                                    {asset.assetName}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="font-mono font-bold tracking-tight">{asset.serialNumber}</span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                    <span>{asset.assetType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-2 py-1 rounded-md ${statusConfig.bg} ${statusConfig.color} text-[10px] font-black uppercase tracking-wider whitespace-nowrap border border-current/10`}>
                            {asset.status === 'IN_USE' || asset.status === 'InUse' ? 'In Use' : asset.status || 'Unknown'}
                        </div>
                    </div>

                    {/* Assignment Info (if assigned) */}
                    {asset.assignedTo && (
                        <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{asset.assignedTo}</span>
                            </div>
                        </div>
                    )}

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 bg-slate-50/30 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Purchased</span>
                            </div>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                {formatDate(asset.purchaseDate)}
                            </p>
                        </div>

                        <div className="p-2 bg-slate-50/30 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Shield className="h-3 w-3 text-slate-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Warranty</span>
                            </div>
                            <p className={`text-xs font-bold ${warrantyExpired ? 'text-rose-600' : warrantyExpiring ? 'text-amber-600' : 'text-slate-600'}`}>
                                {formatDate(asset.warrantyExpiry)}
                            </p>
                        </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && asset.configuration && (
                        <div className="mb-3 p-2 bg-slate-100/30 dark:bg-slate-900/30 rounded-lg border border-slate-200/20">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Specs</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{asset.configuration}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onHistory(asset)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all font-bold"
                            title="History"
                        >
                            <History className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Log</span>
                        </button>

                        <button
                            onClick={() => onQRCode(asset)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-all font-bold"
                            title="QR Code"
                        >
                            <QrCode className="h-3.5 w-3.5" />
                            <span className="text-[10px]">QR</span>
                        </button>

                        <div className="flex items-center gap-1 ml-auto">
                            <button
                                onClick={() => onEdit(asset)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                                onClick={() => onDelete(asset)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            {asset.configuration && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                                >
                                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${statusConfig.gradient.replace('/10', '/5')} blur-xl`}></div>
                </div>
            </div>
        </div>
    );
}
