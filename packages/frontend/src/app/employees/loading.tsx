export default function Loading() {
    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen animate-pulse">
            <div className="flex justify-between items-center h-20">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-72 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                ))}
            </div>
        </div>
    );
}
