import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PremiumPageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
    gradient?: string;
}

export default function PremiumPageHeader({
    icon: Icon,
    title,
    subtitle,
    actions,
    gradient = 'from-indigo-600 via-purple-600 to-pink-600'
}: PremiumPageHeaderProps) {
    return (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 shadow-2xl`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            {title}
                        </h1>
                    </div>
                    <p className="text-white/90 font-medium text-lg">
                        {subtitle}
                    </p>
                </div>

                {actions && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
