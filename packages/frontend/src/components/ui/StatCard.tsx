import { ReactNode } from 'react';
import Card from './Card';
import { LucideIcon } from 'lucide-react';
// import { cn } from '@/lib/utils';

// If cn doesn't exist, I'll need to check utils. Use standard str concat for safety if unsure.
// Checked dashboard/page.tsx, it imports formatNumber from '@/lib/utils'. I didn't see cn there but it is common.
// I'll stick to template literals for safety.

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon; // or generic ComponentType
    gradient: string; // e.g. "from-emerald-500 to-teal-600"
    iconBg: string; // e.g. "bg-emerald-50 dark:bg-emerald-900/10"
    iconColor: string; // e.g. "text-emerald-600 dark:text-emerald-400"
    onClick?: () => void;
    isActive?: boolean;
    subText?: string | ReactNode;
    className?: string;
    isLoading?: boolean;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    gradient,
    iconBg,
    iconColor,
    onClick,
    isActive,
    subText,
    className = '',
    isLoading = false
}: StatCardProps) {

    // Base classes matching Dashboard's look
    const cardClasses = `relative overflow-hidden border-none shadow-lg shadow-slate-200/50 dark:shadow-none transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${className} ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`;

    return (
        <Card className={cardClasses} onClick={onClick}>
            {isLoading ? (
                <div className="p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                </div>
            ) : (
                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{value}</h3>
                            {subText && <div className="mt-1 text-xs text-slate-500">{subText}</div>}
                        </div>
                        <div className={`p-3 rounded-xl ${iconBg}`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                    </div>
                    {/* Decorative Gradient Blob */}
                    <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl`}></div>
                </div>
            )}
        </Card>
    );
}
