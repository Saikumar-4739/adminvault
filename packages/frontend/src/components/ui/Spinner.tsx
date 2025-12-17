import { Hexagon, Loader2 } from 'lucide-react';

export function Spinner({ className = "h-5 w-5", color = "text-indigo-600" }: { className?: string; color?: string }) {
    return (
        <Loader2 className={`animate-spin ${className} ${color}`} />
    );
}

export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-6 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
                {/* Outer Ring Effect */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>

                {/* Rotating Border */}
                <div className="h-20 w-20 rounded-2xl border-2 border-indigo-600/30 border-t-indigo-600 border-r-indigo-600 animate-[spin_3s_linear_infinite] absolute"></div>
                <div className="h-20 w-20 rounded-2xl border-2 border-indigo-400/20 animate-[spin_3s_linear_infinite_reverse] absolute rotate-45"></div>

                {/* Central Icon */}
                <div className="bg-white dark:bg-slate-900 h-14 w-14 rounded-xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center z-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-indigo-100/50 dark:from-slate-800 dark:to-slate-800/50 opacity-50"></div>
                    <Hexagon className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-[pulse_2s_ease-in-out_infinite] fill-indigo-100 dark:fill-indigo-900/30" strokeWidth={2.5} />
                </div>
            </div>

            <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Admin<span className="text-indigo-600">Vault</span></h3>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 animate-pulse">Loading Application Data...</p>
            </div>
        </div>
    )
}
