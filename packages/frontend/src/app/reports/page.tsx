'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Users, Package, Ticket, TrendingUp, BarChart3, FileSpreadsheet, CheckCircle2, Clock, AlertCircle, ArrowLeft, FileDown, Search, Zap } from 'lucide-react';
import { reportsService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import PageHeader from '@/components/ui/PageHeader';

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
    gradient: string;
    bgLight: string;
    bgDark: string;
    textColor: string;
    reports: ReportItem[];
}

export default function ReportsPage() {
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
            title: 'Asset Strategy',
            description: 'Inventory, Lifecycle & Allocation Analytics',
            icon: Package,
            gradient: 'from-blue-600 to-cyan-500',
            bgLight: 'bg-blue-50',
            bgDark: 'dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            reports: [
                { name: 'Asset Inventory Report', description: 'Global inventory status and lifecycle metrics', icon: BarChart3, stats: 'All Assets' },
                { name: 'Asset Allocation Plan', description: 'Resource distribution across operational units', icon: Users, stats: 'Assigned' },
                { name: 'Warranty Watchlist', description: 'Predictive maintenance and warranty coverage', icon: Clock, stats: 'Active' },
                { name: 'Operational Intensity', description: 'Asset utilization by key departments', icon: TrendingUp, stats: 'Utilization' },
                { name: 'Device Diversity', description: 'Segmented breakdown by brand and type', icon: Package, stats: 'Breakdown' },
                { name: 'Liquid Assets (Unassigned)', description: 'Available resources for immediate deployment', icon: AlertCircle, stats: 'Available' },
            ]
        },
        {
            id: 'employees',
            title: 'Human Capital',
            description: 'Workforce Dynamics & Identity',
            icon: Users,
            gradient: 'from-indigo-600 to-violet-500',
            bgLight: 'bg-indigo-50',
            bgDark: 'dark:bg-indigo-900/20',
            textColor: 'text-indigo-600 dark:text-indigo-400',
            reports: [
                { name: 'Employee Portfolio', description: 'Comprehensive directory with operational context', icon: Users, stats: 'Directory' },
                { name: 'Workforce Distribution', description: 'Employee density by organizational structure', icon: TrendingUp, stats: 'By Dept' },
            ]
        },
        {
            id: 'tickets',
            title: 'Support Intelligence',
            description: 'Operations Support & SLA Analytics',
            icon: Ticket,
            gradient: 'from-amber-600 to-orange-500',
            bgLight: 'bg-amber-50',
            bgDark: 'dark:bg-amber-900/20',
            textColor: 'text-amber-600 dark:text-amber-400',
            reports: [
                { name: 'Inquiry Analytics', description: 'High-level overview of support performance', icon: TrendingUp, stats: 'All Trends' },
                { name: 'Critical Backlog', description: 'Real-time analysis of pending operations', icon: AlertCircle, stats: 'Backlog' },
                { name: 'Success Metrics (Resolved)', description: 'Resolution efficiency and throughput audit', icon: CheckCircle2, stats: 'Resolved' },
                { name: 'Priority Matrix', description: 'Response prioritization and status breakdown', icon: BarChart3, stats: 'Impact' },
                { name: 'Issue Categorization', description: 'Pattern recognition by service category', icon: FileText, stats: 'Category' },
            ]
        },
        {
            id: 'masters',
            title: 'Core Configuration',
            description: 'Structural Integrity & System Records',
            icon: FileSpreadsheet,
            gradient: 'from-emerald-600 to-teal-500',
            bgLight: 'bg-emerald-50',
            bgDark: 'dark:bg-emerald-900/20',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            reports: [
                { name: 'Entity Structure Audit', description: 'Relational mapping of departments and resources', icon: TrendingUp, stats: 'Mapping' },
                { name: 'Hardware standards', description: 'Vendor standardization and model compliance', icon: Package, stats: 'Standards' },
            ]
        }
    ];

    const generateReport = async () => {
        if (!selectedReport) return;
        setIsLoading(true);
        try {
            const response = await reportsService.generateReport(selectedReport, { format: 'detailed' });
            setReportData(response);
            toast.success('System audit complete', 'Preview generated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Audit sequence failed', 'Could not synthesize report data');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFullReport = async (format: 'excel' | 'pdf') => {
        if (!selectedReport) return;
        setIsExporting(true);
        try {
            const response = await reportsService.generateReport(selectedReport, { format });
            const mimeType = format === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf';
            const extension = format === 'excel' ? 'xlsx' : 'pdf';

            const blob = new Blob([response], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedReport.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success(`Data exported: ${format.toUpperCase()}`, 'The document has been securely downloaded');
        } catch (error) {
            console.error(error);
            toast.error('Export inhibited', 'System could not compile requested document');
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
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            {selectedReport ? (
                // Detailed Report View
                <div className="min-h-screen bg-white dark:bg-[#020617] p-3 lg:p-6 animate-in fade-in duration-500">
                    {/* Back Navigation */}
                    <div className="mb-8">
                        <button
                            onClick={() => { setSelectedReport(null); setReportData(null); }}
                            className="flex items-center gap-2 group text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold text-xs uppercase tracking-widest mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Return to Repository
                        </button>

                        {(() => {
                            const cat = reportCategories.find(c => c.reports.some(r => r.name === selectedReport));
                            const report = cat?.reports.find(r => r.name === selectedReport);
                            return (
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat?.gradient} shadow-2xl shadow-indigo-500/20 flex items-center justify-center rotate-3`}>
                                            {report?.icon && <report.icon className="h-7 w-7 text-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${cat?.bgLight} ${cat?.bgDark} ${cat?.textColor}`}>
                                                    {cat?.title}
                                                </span>
                                            </div>
                                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{selectedReport}</h1>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => downloadFullReport('excel')}
                                            disabled={!reportData || isExporting}
                                            leftIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}
                                            className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-[10px] font-bold"
                                        >
                                            Excel
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => downloadFullReport('pdf')}
                                            disabled={!reportData || isExporting}
                                            leftIcon={<FileDown className="h-3.5 w-3.5" />}
                                            className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-[10px] font-bold"
                                        >
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Report Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        <div className="xl:col-span-3">
                            <Card className="min-h-[600px] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl relative overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                                {!reportData ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
                                            <div className="relative w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <FileText className="h-10 w-10 text-slate-400" />
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Audit Readiness Confirmed</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
                                            The system is ready to synthesize raw data for <b>{selectedReport}</b>. This process includes integrity checks and real-time synchronization.
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={generateReport}
                                            isLoading={isLoading}
                                            leftIcon={<Zap className="h-3.5 w-3.5" />}
                                            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 text-[11px] font-bold"
                                        >
                                            Initiate Data Synthesis
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Live Repository Preview
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                                                    Cache Ready: {new Date().toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            {Array.isArray(reportData) && reportData.length > 0 ? (
                                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-50/30 dark:bg-black/20">
                                                    <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
                                                                    {Object.keys(reportData[0]).map((header) => (
                                                                        <th key={header} className="px-4 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                                            {header.replace(/_/g, ' ')}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                                {reportData.slice(0, 100).map((row: any, idx: number) => (
                                                                    <tr key={idx} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-all">
                                                                        {Object.values(row).map((cell: any, cellIdx: number) => (
                                                                            <td key={cellIdx} className="px-4 py-3 text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                                                {cell === null || cell === undefined ? <span className="text-slate-300">-</span> : String(cell)}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-96">
                                                    <Search className="h-12 w-12 text-slate-200 mb-4" />
                                                    <h3 className="text-lg font-bold">Zero Results</h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="p-4 border-none shadow-xl bg-slate-900 text-white relative overflow-hidden group">
                                <TrendingUp className="absolute -top-4 -right-4 h-24 w-24 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">Integrity Audit</h4>
                                <p className="text-[11px] font-medium leading-relaxed text-slate-300">
                                    {reportCategories.find(c => c.reports.some(r => r.name === selectedReport))?.reports.find(r => r.name === selectedReport)?.description}
                                </p>
                            </Card>
                            <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Operational Details</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-bold">Status</span>
                                        <span className="font-black text-emerald-500 uppercase">Authenticated</span>
                                    </li>
                                    <li className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 font-bold">Sync</span>
                                        <span className="font-black text-indigo-500 uppercase">Live</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Reports Hub List View
                <div className="min-h-screen bg-slate-50/30 dark:bg-[#020617] p-3 lg:p-6 animate-in fade-in duration-500">
                    <PageHeader
                        title="Reports Hub"
                        description="Enterprise Operational Intelligence & Advanced Audit Systems"
                        icon={<BarChart3 />}
                        gradient="from-indigo-600 to-blue-500"
                    >
                        <div className="relative group max-w-md ml-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Identify specific report matrix..."
                                className="block w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </PageHeader>

                    {/* Tabs */}
                    <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                        {reportCategories.map((category) => {
                            const Icon = category.icon;
                            const isActive = activeTab === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveTab(category.id)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10 ring-1 ring-slate-200 dark:ring-slate-700'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'scale-110' : 'opacity-60'} transition-transform`} />
                                    {category.title}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    {activeCategory && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl bg-gradient-to-br ${activeCategory.gradient} shadow-lg shadow-indigo-500/20 text-white`}>
                                        <activeCategory.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{activeCategory.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeCategory.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                        {activeCategoryReports.length} {activeCategoryReports.length === 1 ? 'Report' : 'Reports'} Identified
                                    </span>
                                </div>
                            </div>

                            {activeCategoryReports.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {activeCategoryReports.map((report, idx) => {
                                        const ReportIcon = report.icon;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedReport(report.name)}
                                                className="flex flex-col p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden text-left ring-1 ring-slate-100 dark:ring-slate-800"
                                            >
                                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${activeCategory.gradient} opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity`}></div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-2 rounded-lg ${activeCategory.bgLight} ${activeCategory.bgDark}`}>
                                                        <ReportIcon className={`h-4 w-4 ${activeCategory.textColor}`} />
                                                    </div>
                                                    <div className="p-1.5 rounded-full border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                                        <Zap className="h-2.5 w-2.5 text-indigo-500" />
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1.5 group-hover:text-indigo-600 transition-colors">
                                                    {report.name}
                                                </h4>
                                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                                                    {report.description}
                                                </p>
                                                <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                                    <TrendingUp className={`h-3 w-3 ${activeCategory.textColor} opacity-60`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeCategory.textColor}`}>
                                                        {report.stats}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900/50 p-20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                        <Search className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Reports Found</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Try refining your search matrix.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </RouteGuard>
    );
}
