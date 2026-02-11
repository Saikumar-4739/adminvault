'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileText, Users, Package, Ticket, TrendingUp, BarChart3, FileSpreadsheet, CheckCircle2, Clock, AlertCircle, ArrowLeft, FileDown, Search, ShieldCheck } from 'lucide-react';
import { reportsService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { PageHeader } from '@/components/ui/PageHeader';

interface ReportItem {
    name: string;
    description: string;
    icon: any;
    stats: string;
}

interface ReportCategory {
    id: string;
    title: string;
    description: string;
    icon: any;
    reports: ReportItem[];
}

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('assets');
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    const reportCategories: ReportCategory[] = [
        {
            id: 'assets',
            title: 'Asset Reports',
            description: 'Comprehensive asset inventory and allocation analytics',
            icon: Package,
            reports: [
                { name: 'Asset Inventory Report', description: 'Complete inventory of all assets with device details and assignment status', icon: BarChart3, stats: 'Full Audit' },
                { name: 'Asset Allocation Report', description: 'Assets currently assigned to employees with department information', icon: Users, stats: 'Assigned' },
                { name: 'Asset Warranty Expiry Report', description: 'Assets with warranty information and days until expiry', icon: Clock, stats: 'Active' },
                { name: 'Asset by Department Report', description: 'Asset distribution and count by department', icon: TrendingUp, stats: 'Distribution' },
                { name: 'Asset by Device Type Report', description: 'Assets grouped by device type, brand, and model with assignment statistics', icon: Package, stats: 'Categories' },
                { name: 'Unassigned Assets Report', description: 'Available assets not currently assigned to any employee', icon: AlertCircle, stats: 'Available' },
            ]
        },
        {
            id: 'employees',
            title: 'Employee Reports',
            description: 'Workforce directory and departmental analytics',
            icon: Users,
            reports: [
                { name: 'Employee Directory', description: 'Complete employee list with contact information and department details', icon: Users, stats: 'Directory' },
                { name: 'Employees by Department Report', description: 'Employee count and listing grouped by department', icon: TrendingUp, stats: 'Distribution' },
            ]
        },
        {
            id: 'tickets',
            title: 'Ticket Reports',
            description: 'Service desk analytics and performance metrics',
            icon: Ticket,
            reports: [
                { name: 'Ticket Summary Report', description: 'Complete overview of all tickets with status and assignment details', icon: FileText, stats: 'Overview' },
                { name: 'Open Tickets Report', description: 'Currently open tickets with priority and days open tracking', icon: AlertCircle, stats: 'Active' },
                { name: 'Resolved Tickets Report', description: 'Resolved tickets with resolution time and performance metrics', icon: CheckCircle2, stats: 'Completed' },
                { name: 'Tickets by Priority Report', description: 'Ticket statistics grouped by priority level with average resolution time', icon: TrendingUp, stats: 'Priority' },
                { name: 'Tickets by Category Report', description: 'Ticket statistics grouped by category with resolution metrics', icon: BarChart3, stats: 'Categories' },
            ]
        },
        {
            id: 'system',
            title: 'Master Data Reports',
            description: 'System configuration and organizational structure',
            icon: ShieldCheck,
            reports: [
                { name: 'Department Summary Report', description: 'Department overview with employee and asset counts', icon: Users, stats: 'Structure' },
                { name: 'Device Brands Report', description: 'Brand distribution across device types with asset counts', icon: Package, stats: 'Inventory' },
            ]
        },
        {
            id: 'licenses',
            title: 'License Reports',
            description: 'Software license allocation and expiry tracking',
            icon: FileText,
            reports: [
                { name: 'License Assignment Report', description: 'Complete list of software licenses assigned to employees with expiry tracking', icon: BarChart3, stats: 'Assignments' },
            ]
        }
    ];

    const generateReport = async () => {
        if (!selectedReport) return;
        setIsLoading(true);
        try {
            // Backend expects: /reports/generate?type=ReportName&format=detailed
            const response = await reportsService.generateReport(selectedReport, { format: 'detailed' });
            setReportData(response);
            toast.success('Report generated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFullReport = async (format: 'excel' | 'pdf') => {
        if (!selectedReport) return;
        setIsExporting(true);
        try {
            // Backend expects: /reports/generate?type=ReportName&format=excel|pdf
            // Backend returns file buffer with proper headers
            const response = await reportsService.generateReport(selectedReport, { format });

            // Response is already a Blob from the backend
            const mimeType = format === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf';
            const extension = format === 'excel' ? 'xlsx' : 'pdf';

            const blob = response instanceof Blob ? response : new Blob([response], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedReport.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to export report');
        } finally {
            setIsExporting(false);
        }
    };

    const activeCategory = reportCategories.find(c => c.id === activeTab);
    const activeCategoryReports = activeCategory?.reports.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.SUPER_ADMIN]}>
            <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950/50 space-y-6">
                {selectedReport ? (
                    // Detailed Report View
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        {/* Navigation Actions */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => { setSelectedReport(null); setReportData(null); }}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Hub
                            </button>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => downloadFullReport('excel')}
                                    disabled={!reportData || isExporting}
                                    leftIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}
                                    className="h-8 px-3 text-[9px] font-black uppercase tracking-widest shadow-sm border"
                                >
                                    XLSX
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => downloadFullReport('pdf')}
                                    disabled={!reportData || isExporting}
                                    leftIcon={<FileDown className="h-3.5 w-3.5" />}
                                    className="h-8 px-3 text-[9px] font-black uppercase tracking-widest shadow-sm border"
                                >
                                    PDF
                                </Button>
                            </div>
                        </div>

                        {/* Report Context Card */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm">
                            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-1 uppercase">{selectedReport}</h1>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                {reportCategories.find(c => c.reports.some(r => r.name === selectedReport))?.reports.find(r => r.name === selectedReport)?.description}
                            </p>
                        </div>

                        {/* Content Processing Area */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden min-h-[300px]">
                            {!reportData ? (
                                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center space-y-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center animate-pulse">
                                        <FileText className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <div className="max-w-xs space-y-1">
                                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Protocol Staged</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px] leading-relaxed">
                                            Synthesizing live environmental data for generating the latest operational intelligence.
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={generateReport}
                                        isLoading={isLoading}
                                        className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                                    >
                                        Execute Generation
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-0">
                                    {Array.isArray(reportData) && reportData.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                                    <tr>
                                                        {Object.keys(reportData[0]).map((header) => (
                                                            <th key={header} className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] whitespace-nowrap">
                                                                {header.replace(/_/g, ' ')}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                                    {reportData.slice(0, 100).map((row: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group border-b border-slate-50 dark:border-white/5 last:border-0">
                                                            {Object.values(row).map((cell: any, cellIdx: number) => (
                                                                <td key={cellIdx} className="px-6 py-4 text-[11px] font-bold text-slate-600 dark:text-slate-400 min-w-[120px] max-w-[300px] break-words group-hover:text-indigo-500 transition-colors leading-normal">
                                                                    {cell === null || cell === undefined ? <span className="opacity-20">---</span> : String(cell)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500 space-y-4">
                                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full">
                                                <Search className="h-10 w-10 opacity-20" />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-xs">No Data Strings Detected</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Reports Hub List View
                    <div className="space-y-6">
                        <PageHeader
                            title="Reports"
                            description="Real-time operational reporting and data synthesis"
                            icon={<BarChart3 />}
                            gradient="from-indigo-600 to-indigo-800"
                        >
                            <div className="relative max-w-xs ml-auto group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Report Matrix..."
                                    className="pl-11 pr-4 py-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </PageHeader>

                        {/* Hub Navigation and Content */}
                        <div className="space-y-8 pt-4">
                            {/* Unified Tab Navigation */}
                            <div className="flex gap-3 border-b border-slate-200 dark:border-white/10 pb-1">
                                {reportCategories.map((category) => {
                                    const CategoryIcon = category.icon;
                                    const isActive = activeTab === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveTab(category.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-black text-xs uppercase tracking-tight transition-all border-b-2 ${isActive
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-500'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
                                                }`}
                                        >
                                            <CategoryIcon className="h-4 w-4" />
                                            {category.title}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Category Context & Grid */}
                            {activeCategory && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="border-l-4 border-indigo-500 pl-4 py-1">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{activeCategory.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{activeCategory.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                                        {activeCategoryReports.length > 0 ? (
                                            activeCategoryReports.map((report, idx) => {
                                                const ReportIcon = report.icon;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedReport(report.name)}
                                                        className="group p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all text-left relative overflow-hidden"
                                                    >
                                                        <div className="flex items-center justify-between mb-2.5 relative z-10">
                                                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                                                                <ReportIcon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-white/5">
                                                                {report.stats}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white mb-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight relative z-10">
                                                            {report.name}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight line-clamp-2 relative z-10">
                                                            {report.description}
                                                        </p>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-4">
                                                <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg">
                                                    <Search className="h-10 w-10 text-slate-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black uppercase tracking-widest text-slate-900 dark:text-white">Empty Signal Matrix</p>
                                                    <p className="text-xs text-slate-500 font-medium">No intelligence matches your search parameters.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}

export default ReportsPage;