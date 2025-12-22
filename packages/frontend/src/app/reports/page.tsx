'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Download, Users, Package, Ticket } from 'lucide-react';
import { reportsService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const reportCategories = [
        {
            id: 'assets',
            title: 'Asset Reports',
            description: 'Inventory and asset management reports',
            icon: Package,
            color: 'from-green-500 to-green-600',
            reports: [
                { name: 'Asset Inventory Report', description: 'Complete asset inventory with status' },
                { name: 'Asset Allocation Report', description: 'Assets assigned to employees' },
            ]
        },
        {
            id: 'employees',
            title: 'Employee Reports',
            description: 'HR and employee management reports',
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            reports: [
                { name: 'Employee Directory', description: 'Complete employee listing' },
            ]
        },
        {
            id: 'tickets',
            title: 'Ticket Reports',
            description: 'Support ticket analytics and reports',
            icon: Ticket,
            color: 'from-purple-500 to-purple-600',
            reports: [
                { name: 'Ticket Summary Report', description: 'Overview of all tickets' },
            ]
        }
    ];

    const [isExporting, setIsExporting] = useState(false);

    const generateReport = async () => {
        if (!selectedReport) return;
        setIsLoading(true);
        try {
            // Default summary fetch
            const response = await reportsService.generateReport(selectedReport, { format: 'summary' });
            setReportData(response);
            toast.success('Report generated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFullReport = async (format: 'csv' | 'json') => {
        if (!selectedReport) return;
        setIsExporting(true);
        try {
            const response = await reportsService.generateReport(selectedReport, { format: 'detailed' });
            // response should be an array of objects

            if (format === 'json') {
                const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedReport.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
            } else if (format === 'csv') {
                // Simple CSV conversion
                if (Array.isArray(response) && response.length > 0) {
                    const headers = Object.keys(response[0]);
                    const csvContent = [
                        headers.join(','),
                        ...response.map((row: any) => headers.map(header => {
                            const val = row[header];
                            return typeof val === 'object' ? JSON.stringify(val).replace(/,/g, ';') : val;
                        }).join(','))
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedReport.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    toast.success('CSV downloaded');
                } else {
                    toast.error('No detailed data available to export');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to download full report');
        } finally {
            setIsExporting(false);
        }
    };

    if (selectedReport) {
        return (
            <div className="h-screen flex flex-col overflow-hidden">
                <div className="flex-shrink-0 p-6 pb-4 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedReport}</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Generate and download reports
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => { setSelectedReport(null); setReportData(null); }}>
                            ← Back to Reports
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-6">
                                <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {selectedReport}
                                </h3>

                                {!reportData ? (
                                    <div className="space-y-4">
                                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                                            Click below to generate the report based on current data.
                                        </p>
                                        <Button variant="primary" onClick={generateReport} disabled={isLoading}>
                                            {isLoading ? 'Generating...' : 'Generate Report'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="mt-6 text-left w-full max-w-4xl mx-auto space-y-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-h-[500px] overflow-auto font-mono text-sm">
                                            <pre>{JSON.stringify(reportData, null, 2)}</pre>
                                        </div>
                                        <div className="flex justify-center pt-4 gap-3">
                                            <Button variant="outline" onClick={() => downloadFullReport('json')} disabled={isExporting}>
                                                <Download className="h-4 w-4 mr-2" />
                                                {isExporting ? 'Downloading...' : 'Download JSON'}
                                            </Button>
                                            <Button variant="outline" onClick={() => downloadFullReport('csv')} disabled={isExporting}>
                                                <FileText className="h-4 w-4 mr-2" />
                                                {isExporting ? 'Downloading...' : 'Download CSV (Excel)'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 ">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Generate and download various reports for your organization
                    </p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {reportCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Card key={category.id} className="border-slate-200 dark:border-slate-700">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {category.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {category.reports.map((report, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedReport(report.name)}
                                                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                            {report.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            {report.description}
                                                        </p>
                                                    </div>
                                                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
