'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import { Shield, Smartphone, Mail, Key, CheckCircle2, XCircle, QrCode, Copy } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';
import { iamService } from '@/lib/api/services';

interface MFAMethod {
    id: number;
    type: 'TOTP' | 'SMS' | 'EMAIL';
    isEnabled: boolean;
    isPrimary: boolean;
    identifier?: string;
    lastUsed?: Date;
}

export const MFAPage: React.FC = () => {
    const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [setupType, setSetupType] = useState<'TOTP' | 'SMS' | 'EMAIL'>('TOTP');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const { success, error: toastError } = useToast();

    const [formData, setFormData] = useState({
        phoneNumber: '',
        email: '',
        verificationCode: '',
    });

    useEffect(() => {
        fetchMFAMethods();
    }, []);

    const fetchMFAMethods = async () => {
        try {
            const response = await iamService.getMFAMethods();
            if (response.status && response.data) {
                setMfaMethods(response.data);
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to fetch MFA methods');
        }
    };

    const handleSetupMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await iamService.setupMFA({ type: setupType, ...formData });
            if (response.status) {
                success('Success', response.message || 'MFA method enabled successfully');
                setIsModalOpen(false);
                fetchMFAMethods();
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to enable MFA');
        }
    };

    const handleDisableMFA = async (id: number) => {
        if (confirm('Disable this MFA method?')) {
            try {
                const response = await iamService.disableMFA(id);
                if (response.status) {
                    success('Success', response.message || 'MFA method disabled successfully');
                    fetchMFAMethods();
                }
            } catch (error: any) {
                toastError('Error', error.message || 'Failed to disable MFA');
            }
        }
    };

    const generateBackupCodes = async () => {
        try {
            const response = await iamService.generateBackupCodes();
            if (response.status && response.data) {
                setBackupCodes(response.data);
                success('Success', 'Backup codes generated');
            }
        } catch (error: any) {
            toastError('Error', error.message || 'Failed to generate backup codes');
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'));
        success('Copied', 'Backup codes copied to clipboard');
    };

    const getMethodIcon = (type: string) => {
        switch (type) {
            case 'TOTP':
                return <Smartphone className="h-5 w-5" />;
            case 'SMS':
                return <Mail className="h-5 w-5" />;
            case 'EMAIL':
                return <Mail className="h-5 w-5" />;
            default:
                return <Key className="h-5 w-5" />;
        }
    };

    const getMethodColor = (type: string) => {
        switch (type) {
            case 'TOTP':
                return 'from-blue-500 to-indigo-600';
            case 'SMS':
                return 'from-emerald-500 to-teal-600';
            case 'EMAIL':
                return 'from-purple-500 to-pink-600';
            default:
                return 'from-slate-500 to-slate-600';
        }
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER]}>
            <div className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            Multi-Factor Authentication
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            Add an extra layer of security to your account
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Shield className="h-4 w-4" />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add MFA Method
                    </Button>
                </div>

                {/* MFA Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mfaMethods.map((method) => (
                        <div
                            key={method.id}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getMethodColor(method.type)} flex items-center justify-center text-white`}>
                                        {getMethodIcon(method.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{method.type}</h3>
                                        {method.identifier && (
                                            <p className="text-xs text-slate-500 mt-1">{method.identifier}</p>
                                        )}
                                    </div>
                                </div>
                                {method.isEnabled ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Enabled
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800">
                                        <XCircle className="h-3 w-3" />
                                        Disabled
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                {method.isPrimary && (
                                    <div className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded dark:bg-indigo-900/30 dark:text-indigo-400 inline-block">
                                        Primary Method
                                    </div>
                                )}
                                {method.lastUsed && (
                                    <div className="text-xs text-slate-500">
                                        Last used: {new Date(method.lastUsed).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {method.isEnabled ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleDisableMFA(method.id)}
                                    >
                                        Disable
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setSetupType(method.type);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Enable
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Backup Codes */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Backup Codes</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Use these codes if you lose access to your MFA device
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={generateBackupCodes}>
                            Generate Codes
                        </Button>
                    </div>

                    {backupCodes.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Save these codes in a safe place
                                </p>
                                <button
                                    onClick={copyBackupCodes}
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <code key={index} className="text-sm font-mono bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                        {code}
                                    </code>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Setup Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Setup ${setupType} Authentication`} size="lg">
                    <form onSubmit={handleSetupMFA} className="space-y-4">
                        {setupType === 'TOTP' && (
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-center">
                                    <QrCode className="h-32 w-32 mx-auto text-slate-400 mb-3" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Scan this QR code with your authenticator app
                                    </p>
                                </div>
                                <Input
                                    label="Verification Code"
                                    placeholder="Enter 6-digit code"
                                    value={formData.verificationCode}
                                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        {setupType === 'SMS' && (
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                            />
                        )}

                        {setupType === 'EMAIL' && (
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Enable MFA
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RouteGuard>
    );
};

export default MFAPage;
