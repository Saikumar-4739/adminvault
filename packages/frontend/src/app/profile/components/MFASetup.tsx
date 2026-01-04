'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Key, Clipboard, Check } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';

export default function MFASetup() {
    const toast = useToast();
    const [status, setStatus] = useState<{ isEnabled: boolean } | null>(null);
    const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null);
    const [token, setToken] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/iam/mfa/status');
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch MFA status', error);
        }
    };

    const initiateSetup = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/iam/mfa/setup', { method: 'POST' });
            const data = await res.json();
            setSetupData(data);
        } catch (error) {
            toast.error('Failed to initiate MFA setup');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/iam/mfa/verify-enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('MFA enabled successfully!');
                setRecoveryCodes(data.recoveryCodes);
                setStatus({ isEnabled: true });
                setSetupData(null);
            } else {
                toast.error(data.message || 'Invalid token');
            }
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const disableMFA = async () => {
        if (!confirm('Are you sure you want to disable MFA? This will reduce your account security.')) return;
        setIsLoading(true);
        try {
            await fetch('/api/iam/mfa/disable', { method: 'POST' });
            toast.success('MFA disabled');
            setStatus({ isEnabled: false });
            setRecoveryCodes(null);
        } catch (error) {
            toast.error('Failed to disable MFA');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (!status) return <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-48 rounded-xl"></div>;

    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Multi-Factor Authentication (MFA)
                    </h3>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${status.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {status.isEnabled ? 'Protected' : 'Unprotected'}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {!status.isEnabled && !setupData && (
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800">
                            <ShieldAlert className="h-12 w-12 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900 dark:text-white">Enable 2FA Protection</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                                Protect your account with an additional layer of security. We support any standard TOTP app like Google Authenticator or Authy.
                            </p>
                        </div>
                        <Button variant="primary" onClick={initiateSetup} isLoading={isLoading}>
                            Configure MFA
                        </Button>
                    </div>
                )}

                {setupData && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="shrink-0 p-4 bg-white rounded-xl shadow-md border border-slate-100">
                                <img src={setupData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Scan the QR Code</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Open your authenticator app and scan this code. If you cannot scan it, use the manual key below.
                                </p>
                                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                                    <Key className="h-4 w-4 text-slate-400" />
                                    <code className="flex-1 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                        {setupData.secret}
                                    </code>
                                    <button onClick={() => copyToClipboard(setupData.secret)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                                        <Clipboard className="h-3.5 w-3.5 text-slate-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-3">Verification Code</p>
                            <div className="flex gap-3">
                                <Input
                                    className="max-w-[200px]"
                                    placeholder="000 000"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    maxLength={6}
                                />
                                <Button variant="primary" onClick={verifyAndEnable} isLoading={isLoading} disabled={token.length < 6}>
                                    Verify & Activate
                                </Button>
                                <Button variant="ghost" onClick={() => setSetupData(null)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {status.isEnabled && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                            <div className="p-2 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/20">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Two-factor authentication is active</p>
                                <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70 mt-0.5">Your account is secured with TOTP authentication.</p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto text-rose-600 border-rose-200 hover:bg-rose-50" onClick={disableMFA} isLoading={isLoading}>
                                Disable
                            </Button>
                        </div>

                        {recoveryCodes && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 space-y-3">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                                    <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider">Save Recovery Codes</p>
                                </div>
                                <p className="text-[10px] text-amber-700/70 dark:text-amber-500/70">
                                    Store these codes in a safe place. If you lose your device, you'll need them to access your account.
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {recoveryCodes.map((code, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-amber-200 dark:border-amber-800/50">
                                            <code className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">{code}</code>
                                            <Check className="h-3 w-3 text-emerald-500" />
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="w-full bg-white dark:bg-slate-900 border-amber-200 text-amber-700" onClick={() => copyToClipboard(recoveryCodes.join('\n'))}>
                                    Copy All Codes
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
