import { PageLoader } from '@/components/ui/Spinner';

/**
 * Global Loading Component for Next.js App Router
 * Provides a smooth transition between pages
 */
export default function Loading() {
    return (
        <div className="flex-1 h-full w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm min-h-[400px]">
            <PageLoader message="Loading AdminVault..." />
        </div>
    );
}
