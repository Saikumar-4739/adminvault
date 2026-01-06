'use client';

import React from 'react';

interface PageLoaderProps {
    message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                {/* Spinning ring */}
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
                {message}
            </p>
        </div>
    );
}

interface CardSkeletonProps {
    count?: number;
    className?: string;
}

export function CardSkeleton({ count = 6, className }: CardSkeletonProps) {
    return (
        <div className={className || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="h-48 bg-white dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800"
                >
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface TableSkeletonProps {
    rows?: number;
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description
}: {
    icon: React.ComponentType<{ className?: string }>,
    title: string,
    description: string
}) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                <Icon className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">{description}</p>
        </div>
    );
}
