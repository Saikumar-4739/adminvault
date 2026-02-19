export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950/50">
            <div className="flex-1 p-4 lg:p-8 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
