"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    CheckCircle2,
    Circle,
    Clock,
    ArrowRight,
    UserPlus,
    UserMinus,
    Search,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { onboardingService } from '@/lib/api/services';
import { OnboardingWorkflowModel, WorkflowType, StepStatus } from '@adminvault/shared-models';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function OnboardingDashboard() {
    const { user } = useAuth();
    const [workflows, setWorkflows] = useState<OnboardingWorkflowModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWorkflows = async () => {
        if (!user?.companyId) return;
        try {
            setLoading(true);
            const data = await onboardingService.getActiveWorkflows(user.companyId);
            setWorkflows(data || []);
        } catch (error) {
            console.error('Failed to fetch workflows', error);
            toast.error('Failed to load active workflows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, [user?.companyId]);

    const handleCompleteStep = async (stepId: number) => {
        try {
            const res = await onboardingService.completeStep(stepId);
            if (res.status) {
                toast.success('Step completed');
                fetchWorkflows();
            }
        } catch (error) {
            toast.error('Failed to update step');
        }
    };

    const filteredWorkflows = workflows.filter(w =>
        w.employeeId.toString().includes(searchTerm) ||
        w.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-blue-600" />
                        Lifecycle Management
                    </h1>
                    <p className="text-gray-500">Track employee onboarding and offboarding workflows</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : filteredWorkflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-gray-900">No active workflows</h3>
                    <p className="text-gray-500">All employees are successfully processed.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkflows.map((workflow) => (
                        <div key={workflow.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            <div className={`px-4 py-3 flex items-center justify-between ${workflow.type === WorkflowType.ONBOARDING ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                <div className="flex items-center gap-2">
                                    {workflow.type === WorkflowType.ONBOARDING ? (
                                        <UserPlus className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <UserMinus className="w-5 h-5 text-orange-600" />
                                    )}
                                    <span className={`text-sm font-semibold ${workflow.type === WorkflowType.ONBOARDING ? 'text-blue-700' : 'text-orange-700'}`}>
                                        {workflow.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {new Date(workflow.startedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="p-4 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Employee ID: {workflow.employeeId}</h3>
                                        <p className="text-sm text-gray-500">Processing lifecycle steps...</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Progress</span>
                                        <span className="text-sm font-bold text-blue-600">
                                            {Math.round((workflow.steps.filter(s => s.status === StepStatus.COMPLETED).length / workflow.steps.length) * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {workflow.steps.sort((a, b) => a.order - b.order).map((step) => (
                                        <div key={step.id} className="flex items-start gap-3 group">
                                            <button
                                                onClick={() => step.status !== StepStatus.COMPLETED && handleCompleteStep(step.id)}
                                                disabled={step.status === StepStatus.COMPLETED}
                                                className={`mt-0.5 transition-colors ${step.status === StepStatus.COMPLETED ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                                            >
                                                {step.status === StepStatus.COMPLETED ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <Circle className="w-5 h-5" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium ${step.status === StepStatus.COMPLETED ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                    {step.title}
                                                </h4>
                                                <p className="text-xs text-gray-500">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {workflow.status}
                                </span>
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                    View Detail
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
