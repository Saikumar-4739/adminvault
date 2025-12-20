'use client';

import { useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Download, Filter, Calendar, TrendingUp, Users, Package, Ticket } from 'lucide-react';

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

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
                { name: 'Asset Depreciation Report', description: 'Asset value depreciation analysis' },
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
                { name: 'Department Wise Report', description: 'Employees grouped by department' },
                { name: 'Asset Assignment Report', description: 'Assets assigned to each employee' },
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
                { name: 'Category Wise Report', description: 'Tickets grouped by category' },
                { name: 'Resolution Time Report', description: 'Average ticket resolution times' },
            ]
        },
        {
            id: 'analytics',
            title: 'Analytics Reports',
            description: 'Business intelligence and trends',
            icon: TrendingUp,
            color: 'from-orange-500 to-orange-600',
            reports: [
                { name: 'Usage Analytics', description: 'System usage statistics' },
                { name: 'Performance Metrics', description: 'Key performance indicators' },
                { name: 'Trend Analysis', description: 'Historical data trends' },
            ]
        },
    ];

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
                        <Button variant="outline" onClick={() => setSelectedReport(null)}>
                            ← Back to Reports
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {selectedReport}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Report generation feature coming soon
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter Options
                                    </Button>
                                    <Button variant="outline">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Date Range
                                    </Button>
                                    <Button variant="primary">
                                        <Download className="h-4 w-4 mr-2" />
                                        Generate Report
                                    </Button>
                                </div>
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
            <div className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-700">
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
