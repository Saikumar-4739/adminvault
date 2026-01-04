'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
    FileText, Download, Users, Package, Ticket,
    TrendingUp, Calendar, BarChart3, FileSpreadsheet,
    CheckCircle2, Clock, AlertCircle, ArrowLeft, FileDown
} from 'lucide-react';
import { reportsService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const toast = useToast();

    const reportCategories = [
        {
            id: 'assets',
            title: 'Asset Reports',
            description: 'Comprehensive asset tracking and allocation',
            icon: Package,
            gradient: 'from-emerald-500 to-teal-600',
            bgLight: 'bg-emerald-50',
            bgDark: 'dark:bg-emerald-900/10',
            reports: [
                {
                    name: 'Asset Inventory Report',
                    description: 'Complete asset inventory with status, assignments, and warranty details',
                    icon: BarChart3,
                    stats: 'All Assets'
                },
                {
                    name: 'Asset Allocation Report',
                    description: 'Detailed view of assets assigned to employees',
                    icon: Users,
                    stats: 'Assigned Assets'
                },
            ]
        },
        {
            id: 'employees',
            title: 'Employee Reports',
            description: 'Workforce analytics and directory',
            icon: Users,
            gradient: 'from-violet-500 to-purple-600',
            bgLight: 'bg-violet-50',
            bgDark: 'dark:bg-violet-900/10',
            reports: [
                {
                    name: 'Employee Directory',
                    description: 'Complete employee listing with departments and contact information',
                    icon: Users,
                    stats: 'All Employees'
                },
            ]
        },
        {
            id: 'tickets',
            title: 'Ticket Reports',
            description: 'Support ticket analytics and trends',
            icon: Ticket,
            gradient: 'from-amber-500 to-orange-600',
            bgLight: 'bg-amber-50',
            bgDark: 'dark:bg-amber-900/10',
            reports: [
                {
                    name: 'Ticket Summary Report',
                    description: 'Overview of all tickets with status, priority, and resolution details',
                    icon: TrendingUp,
                    stats: 'All Tickets'
                },
            ]
        }
    ];

    const generateReport = async () => {
        if (!selectedReport) return;
        setIsLoading(true);
        try {
            const response = await reportsService.generateReport(selectedReport, { format: 'detailed' });
            setReportData(response);
            toast.success('Report preview generated');
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
            toast.success(`${format.toUpperCase()} report downloaded`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to download report');
        } finally {
            setIsExporting(false);
        }
    };

    if (selectedReport) {
        const category = reportCategories.find(cat =>
            cat.reports.some(r => r.name === selectedReport)
        );
        const report = category?.reports.find(r => r.name === selectedReport);

        return (
            <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
                <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 lg:p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => { setSelectedReport(null); setReportData(null); }}
                            leftIcon={<ArrowLeft className="h-4 w-4" />}
                            className="mb-4"
                        >
                            Back to Reports
                        </Button>
                        <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${category?.gradient} shadow-lg`}>
                                {report?.icon && <report.icon className="h-8 w-8 text-white" />}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedReport}</h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {report?.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Report Preview */}
                        <div className="lg:col-span-2">
                            <Card className="p-6 border-none shadow-md">
                                {!reportData ? (
                                    <div className="text-center py-12">
                                        <div className={`inline-flex p-6 rounded-2xl ${category?.bgLight} ${category?.bgDark} mb-4`}>
                                            <FileText className="h-12 w-12 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                            Ready to Generate Report
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                            Click the button below to generate a preview of this report with current data
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={generateReport}
                                            disabled={isLoading}
                                            leftIcon={<BarChart3 className="h-4 w-4" />}
                                            className="shadow-lg"
                                        >
                                            {isLoading ? 'Generating Preview...' : 'Generate Preview'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                Report Preview
                                            </h3>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date().toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Table Preview */}
                                        {Array.isArray(reportData) && reportData.length > 0 ? (
                                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                <div className="overflow-x-auto max-h-[500px]">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-indigo-50 dark:bg-indigo-900/20 sticky top-0">
                                                            <tr>
                                                                {Object.keys(reportData[0]).map((header) => (
                                                                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800">
                                                            {reportData.slice(0, 50).map((row: any, idx: number) => (
                                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                                    {Object.values(row).map((cell: any, cellIdx: number) => (
                                                                        <td key={cellIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                                            {cell !== null && cell !== undefined ? String(cell) : '-'}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {reportData.length > 50 && (
                                                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center">
                                                        Showing first 50 of {reportData.length} records. Download the full report to view all data.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    No data available for preview
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Export Options */}
                        <div className="space-y-4">
                            <Card className="p-6 border-none shadow-md">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Download className="h-4 w-4 text-indigo-500" />
                                    Export Options
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => downloadFullReport('excel')}
                                        disabled={isExporting}
                                        className="w-full p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                                                <FileSpreadsheet className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    Excel Format
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    Download as .xlsx file
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => downloadFullReport('pdf')}
                                        disabled={isExporting}
                                        className="w-full p-4 rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500 rounded-lg group-hover:scale-110 transition-transform">
                                                <FileDown className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    PDF Format
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    Download as .pdf file
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </Card>

                            {/* Info Card */}
                            <Card className="p-6 border-none shadow-md bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                            Report Information
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            Reports include all current data with detailed information. Excel format is recommended for analysis and PDF for sharing.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 lg:p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Generate comprehensive reports for your organization
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Card key={category.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="p-6">
                                    {/* Category Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {category.title}
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reports List */}
                                    <div className="space-y-2">
                                        {category.reports.map((report, idx) => {
                                            const ReportIcon = report.icon;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedReport(report.name)}
                                                    className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${category.bgLight} ${category.bgDark} group-hover:scale-110 transition-transform`}>
                                                            <ReportIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {report.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                                {report.description}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                                    {report.stats}
                                                                </span>
                                                                <TrendingUp className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Info */}
                <Card className="mt-6 p-6 border-none shadow-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                Real-time Data
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                All reports are generated with the latest data from your system. Export in Excel or PDF format for further analysis.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </RouteGuard>
    );
};

export default ReportsPage;
