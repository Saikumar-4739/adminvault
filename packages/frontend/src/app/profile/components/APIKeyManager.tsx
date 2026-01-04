'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Calendar, Activity, Copy, Shield } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';

interface APIKey {
    id: number;
    name: string;
    prefix: string;
    lastUsedAt: string | null;
    createdAt: string;
    isActive: boolean;
}

export default function APIKeyManager() {
    const toast = useToast();
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/iam/api-keys');
            const data = await res.json();
            setKeys(data);
        } catch (error) {
            console.error('Failed to fetch API keys');
        }
    };

    const createKey = async () => {
        if (!newKeyName) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/iam/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            });
            const data = await res.json();
            setGeneratedKey(data.apiKey);
            setNewKeyName('');
            await fetchKeys();
            toast.success('API Key generated successfully');
        } catch (error) {
            toast.error('Failed to generate API key');
        } finally {
            setIsLoading(false);
        }
    };

    const revokeKey = async (id: number) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        try {
            await fetch(`/api/iam/api-keys/${id}`, { method: 'DELETE' });
            toast.success('API Key revoked');
            await fetchKeys();
        } catch (error) {
            toast.error('Failed to revoke API key');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-500" />
                        API Keys
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">Programmatic access for your integrations</p>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

                {/* Create Key Section */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Plus className="h-4 w-4 text-emerald-500" />
                        Create New Access Token
                    </h4>
                    <div className="flex gap-3">
                        <Input
                            placeholder="e.g. Production Webhook System"
                            className="flex-1"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                        />
                        <Button variant="primary" onClick={createKey} isLoading={isLoading} disabled={!newKeyName}>
                            Generate Key
                        </Button>
                    </div>

                    {generatedKey && (
                        <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400">YOUR API KEY (SHOWS ONCE)</span>
                                <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase">
                                    <Shield className="h-3 w-3" /> Secure
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-indigo-200 dark:border-indigo-800">
                                <code className="flex-1 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 break-all">
                                    {generatedKey}
                                </code>
                                <button onClick={() => copyToClipboard(generatedKey)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                    <Copy className="h-3.5 w-3.5 text-indigo-500" />
                                </button>
                            </div>
                            <p className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70 mt-3 italic">
                                Please copy this key now. For security reasons, we won't show it to you again.
                            </p>
                            <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-[10px]" onClick={() => setGeneratedKey(null)}>
                                I have saved the key
                            </Button>
                        </div>
                    )}
                </div>

                {/* Keys List */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Active Keys ({keys.length})</h4>

                    {keys.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <Key className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">No active API keys found</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {keys.map((key) => (
                                <div key={key.id} className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">{key.name}</h5>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Key className="h-3 w-3" />
                                                    {key.prefix}••••••••
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    Created {new Date(key.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Activity className="h-3 w-3 text-emerald-500" />
                                                    {key.lastUsedAt ? `Last active ${new Date(key.lastUsedAt).toLocaleString()}` : 'Never used'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => revokeKey(key.id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {!key.isActive && (
                                        <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full border border-red-200">Revoked</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
