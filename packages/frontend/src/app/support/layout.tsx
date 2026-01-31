export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/50">
            {children}
        </div>
    );
}
