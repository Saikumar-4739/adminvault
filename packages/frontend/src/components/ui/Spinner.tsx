import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'white';
}

export default function Spinner({ size = 'md', variant = 'primary', className, ...props }: SpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };

    const variantClasses = {
        primary: 'text-indigo-600',
        secondary: 'text-slate-500',
        white: 'text-white',
    };

    return (
        <div className={cn('animate-spin', sizeClasses[size], variantClasses[variant], className)} {...props}>
            <Loader2 className={cn('w-full h-full')} />
        </div>
    );
}

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
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

// Export additional loading components
export { CardSkeleton, TableSkeleton, EmptyState } from './LoadingStates';
