
'use client';

/**
 * Global Loading Component for Next.js App Router
 * Provides a smooth transition between pages
 */
export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl transition-all duration-700">
            <div className="relative flex flex-col items-center">
                {/* Visual Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full animate-pulse"></div>

                {/* Logo Section */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[2px] shadow-2xl shadow-blue-500/20">
                            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                <span className="text-3xl font-black text-white italic tracking-tighter">A</span>
                                {/* Internal shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">
                                ADMIN<span className="text-blue-500">VAULT</span>
                            </h1>
                            <div className="h-1 w-full bg-slate-800 mt-2 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-1/3 animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Initializing System...</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%) scaleX(0.2); }
                    50% { transform: translateX(0) scaleX(0.5); }
                    100% { transform: translateX(100%) scaleX(0.2); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
