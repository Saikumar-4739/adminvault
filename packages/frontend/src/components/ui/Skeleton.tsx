import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/50 ${className}`}
            {...props}
        />
    );
}

// Table Row Skeleton helper
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
                </td>
            ))}
        </tr>
    );
}

// Card Skeleton for Grids
export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm animate-pulse h-[200px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="space-y-2 mt-4">
                <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="h-10 rounded bg-slate-100 dark:bg-slate-700/50"></div>
                <div className="h-10 rounded bg-slate-100 dark:bg-slate-700/50"></div>
            </div>
        </div>
    )
}
