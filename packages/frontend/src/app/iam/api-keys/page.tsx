'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { iamService } from '@/lib/api/services';

interface APIKey {
    id: number;
    name: string;
    key: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
    expiresAt?: Date;
    lastUsed?: Date;
    createdAt: Date;
}

export const APIKeysPage: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
    const { success, error: toastError } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
        expiresAt: '',
    });

    useEffect(() => {
        fetchAPIKeys();
    }, []);

    const fetchAPIKeys = async () => {
        setIsLoading(true);
        try {
            const response = await iamService.getAllAPIKeys();
            if (response.status && response.data) {
                setApiKeys(response.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to fetch API keys');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await iamService.createAPIKey(formData);
            if (response.status) {
                success('Success', response.message || 'API key created successfully');
                setIsModalOpen(false);
                setFormData({ name: '', description: '', permissions: [], expiresAt: '' });
                fetchAPIKeys();
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to create API key');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this API key? This action cannot be undone.')) {
            try {
                const response = await iamService.deleteAPIKey(id);
                if (response.status) {
                    success('Success', response.message || 'API key deleted successfully');
                    fetchAPIKeys();
                }
            } catch (error: any) {
                toastError('Error', error.message || 'Failed to delete API key');
            }
        }
    };

    const toggleReveal = (id: number) => {
        setRevealedKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        success('Copied', 'API key copied to clipboard');
    };

    const formatDate = (date?: Date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString();
    };

    const maskKey = (key: string) => {
        return key.substring(0, 8) + '•'.repeat(16) + key.substring(key.length - 4);
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN]}>
            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            API Keys Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            Manage API keys for programmatic access
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus className="h-4 w-4" />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Generate API Key
                    </Button>
                </div>

                {/* API Keys List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : apiKeys.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Key className="h-12 w-12 text-slate-400 mb-3" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No API keys</h3>
                                <p className="text-sm text-slate-500 mt-1">Generate your first API key to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {apiKeys.map((apiKey) => (
                                    <div
                                        key={apiKey.id}
                                        className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <Key className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{apiKey.name}</h3>
                                                    {apiKey.description && (
                                                        <p className="text-xs text-slate-500 mt-1">{apiKey.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {apiKey.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800">
                                                        <XCircle className="h-3 w-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(apiKey.id)}
                                                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* API Key Display */}
                                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 mb-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <code className="text-sm font-mono text-slate-700 dark:text-slate-300 flex-1">
                                                    {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                                                </code>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => toggleReveal(apiKey.id)}
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                        title={revealedKeys.has(apiKey.id) ? 'Hide' : 'Reveal'}
                                                    >
                                                        {revealedKeys.has(apiKey.id) ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(apiKey.key)}
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                        title="Copy"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                            <div>
                                                <div className="text-slate-500 mb-1">Permissions</div>
                                                <div className="flex gap-1">
                                                    {apiKey.permissions.map((perm) => (
                                                        <span key={perm} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            {perm}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 mb-1 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Created
                                                </div>
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    {formatDate(apiKey.createdAt)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 mb-1">Last Used</div>
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    {formatDate(apiKey.lastUsed)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 mb-1">Expires</div>
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate API Key" size="lg">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            label="Key Name"
                            placeholder="Production API Key"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                rows={3}
                                placeholder="Describe the purpose of this API key"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <Input
                            label="Expiration Date (Optional)"
                            type="date"
                            value={formData.expiresAt}
                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        />
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Generate Key
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
};

export default APIKeysPage;
