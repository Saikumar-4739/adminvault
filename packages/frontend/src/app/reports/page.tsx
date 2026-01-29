'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Users, Package, Ticket, TrendingUp, BarChart3, FileSpreadsheet, CheckCircle2, Clock, AlertCircle, ArrowLeft, FileDown, Search, Filter } from 'lucide-react';
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
            description: 'Inventory and allocation analytics',
            icon: Package,
            reports: [
                { name: 'Asset Inventory Report', description: 'Global inventory status and lifecycle metrics', icon: BarChart3, stats: 'All Assets' },
                { name: 'Asset Allocation Plan', description: 'Resource distribution across operational units', icon: Users, stats: 'Assigned' },
                { name: 'Warranty Watchlist', description: 'Predictive tracking and warranty coverage', icon: Clock, stats: 'Active' },
                { name: 'Operational Intensity', description: 'Asset utilization by key departments', icon: TrendingUp, stats: 'Utilization' },
                { name: 'Device Diversity', description: 'Segmented breakdown by brand and type', icon: Package, stats: 'Breakdown' },
                { name: 'Liquid Assets (Unassigned)', description: 'Available resources for immediate deployment', icon: AlertCircle, stats: 'Available' },
            ]
        },
        {
            id: 'employees',
            title: 'Employee Reports',
            description: 'Workforce and directory details',
            icon: Users,
            reports: [
                { name: 'Employee Portfolio', description: 'Comprehensive directory with operational context', icon: Users, stats: 'Directory' },
                { name: 'Workforce Distribution', description: 'Employee density by organizational structure', icon: TrendingUp, stats: 'By Dept' },
            ]
        },
        {
            id: 'tickets',
            title: 'Support Reports',
            description: 'Helpdesk and SLA performance',
            icon: Ticket,
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
            title: 'System Reports',
            description: 'Configuration and system records',
            icon: FileSpreadsheet,
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
            toast.success(`Exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error(error);
            toast.error('Export failed');
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
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8 animate-in fade-in duration-300">
                    <div className="p-4 space-y-4">
                        {/* Back Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => { setSelectedReport(null); setReportData(null); }}
                                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Reports
                            </button>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => downloadFullReport('excel')}
                                    disabled={!reportData || isExporting}
                                    leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                                    className="h-9"
                                >
                                    Export Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => downloadFullReport('pdf')}
                                    disabled={!reportData || isExporting}
                                    leftIcon={<FileDown className="h-4 w-4" />}
                                    className="h-9"
                                >
                                    Export PDF
                                </Button>
                            </div>
                        </div>

                        {/* Report Header */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedReport}</h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                {reportCategories.find(c => c.reports.some(r => r.name === selectedReport))?.reports.find(r => r.name === selectedReport)?.description}
                            </p>
                        </div>

                        {/* Report Content */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-h-[500px]">
                            {!reportData ? (
                                <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                        <FileText className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Ready to Generate</h2>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                                        Click the button below to generate the latest data for this report.
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={generateReport}
                                        isLoading={isLoading}
                                        className="px-8"
                                    >
                                        Generate Report
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4">
                                    {Array.isArray(reportData) && reportData.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                                    <tr>
                                                        {Object.keys(reportData[0]).map((header) => (
                                                            <th key={header} className="px-4 py-3 font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                                {header.replace(/_/g, ' ')}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {reportData.slice(0, 100).map((row: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                            {Object.values(row).map((cell: any, cellIdx: number) => (
                                                                <td key={cellIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                                    {cell === null || cell === undefined ? '-' : String(cell)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                            <Search className="h-8 w-8 mb-2 opacity-50" />
                                            <p>No data found for this report.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Reports Hub List View
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
                    <div className="p-4 space-y-4">
                        <PageHeader
                            title="Reports"
                            description="Access system reports and analytics"
                            icon={<BarChart3 />}
                            gradient="from-indigo-600 to-indigo-700"
                        >
                            <div className="relative max-w-md ml-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    className="pl-9 pr-4 py-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </PageHeader>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                            {reportCategories.map((category) => {
                                const Icon = category.icon;
                                const isActive = activeTab === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveTab(category.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {category.title}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Content */}
                        {activeCategory && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{activeCategory.title}</h3>
                                    <p className="text-sm text-slate-500">{activeCategory.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeCategoryReports.length > 0 ? (
                                        activeCategoryReports.map((report, idx) => {
                                            const ReportIcon = report.icon;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedReport(report.name)}
                                                    className="flex flex-col p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all text-left group"
                                                >
                                                    <div className="flex items-start justify-between mb-3 w-full">
                                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                            <ReportIcon className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-full">
                                                            {report.stats}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {report.name}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                        {report.description}
                                                    </p>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                            <p>No reports found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </RouteGuard>
    );
}

export default ReportsPage;