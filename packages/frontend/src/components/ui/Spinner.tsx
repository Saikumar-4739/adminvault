import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', variant = 'primary', className, ...props }) => {
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
};

// Re-export PageLoader and other loading states from the dedicated file
export { PageLoader, CardSkeleton, TableSkeleton, EmptyState } from './LoadingStates';


