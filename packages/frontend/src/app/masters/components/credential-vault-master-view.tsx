import { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { CreateCredentialVaultModel, UpdateCredentialVaultModel, CredentialVaultModel, IdRequestModel } from '@adminvault/shared-models';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Pencil, Trash2, Key, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CredentialVaultService } from '@adminvault/shared-services';

interface CredentialVaultMasterViewProps {
    onBack?: () => void;
    searchTerm?: string;
}

export interface CredentialVaultMasterViewHandle {
    showAddModal: () => void;
}

export const CredentialVaultMasterView = forwardRef<CredentialVaultMasterViewHandle, CredentialVaultMasterViewProps>(({ onBack, searchTerm = '' }, ref) => {
    const { user } = useAuth();
    const [vaults, setVaults] = useState<CredentialVaultModel[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        appName: '',
        description: '',
        password: '',
        expireDate: '',
        owner: '',
        deviceSerialNumber: '',
        ipAddress: '',
        recoveryEmail: '',
        isActive: true
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
    const vaultService = new CredentialVaultService();
    const initialized = useRef(false);

    useImperativeHandle(ref, () => ({
        showAddModal: () => setIsModalOpen(true)
    }));

    useEffect(() => {
        if (!initialized.current && user?.companyId) {
            initialized.current = true;
            getAllVaults();
        }
    }, [user?.companyId]);

    const getAllVaults = async (): Promise<void> => {
        if (!user?.companyId) return;
        try {
            const req = new IdRequestModel(user.companyId);
            const response = await vaultService.getAllCredentialVaults(req);
            if (response.status) {
                setVaults(response.data || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    };

    const filteredVaults = useMemo(() => {
        return vaults.filter(v =>
            v.appName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.deviceSerialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.recoveryEmail?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vaults, searchTerm]);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!user || (!user.companyId && user.companyId !== 0)) return;
        try {
            if (isEditMode && editingId) {
                const model = new UpdateCredentialVaultModel(
                    editingId,
                    formData.appName,
                    formData.description,
                    formData.password,
                    formData.expireDate ? new Date(formData.expireDate) : undefined,
                    formData.owner,
                    formData.isActive,
                    formData.deviceSerialNumber,
                    formData.ipAddress,
                    formData.recoveryEmail
                );
                const response = await vaultService.updateCredentialVault(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const model = new CreateCredentialVaultModel(
                    user.id,
                    user.companyId,
                    formData.appName,
                    formData.description,
                    formData.password,
                    formData.expireDate ? new Date(formData.expireDate) : undefined,
                    formData.owner,
                    formData.isActive ?? true,
                    formData.deviceSerialNumber,
                    formData.ipAddress,
                    formData.recoveryEmail
                );
                const response = await vaultService.createCredentialVault(model);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    getAllVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (err: any) {
            AlertMessages.getErrorMessage(err.message);
        }
    };

    const handleEdit = (item: CredentialVaultModel, e: React.MouseEvent): void => {
        e.stopPropagation();
        setIsEditMode(true);
        setEditingId(item.id);
        const expireDateStr = item.expireDate
            ? (typeof item.expireDate === 'string' ? item.expireDate.split('T')[0] : new Date(item.expireDate).toISOString().split('T')[0])
            : '';

        setFormData({
            appName: item.appName || '',
            description: item.description || '',
            password: item.password || '',
            owner: item.owner || '',
            deviceSerialNumber: item.deviceSerialNumber || '',
            ipAddress: item.ipAddress || '',
            recoveryEmail: item.recoveryEmail || '',
            expireDate: expireDateStr,
            isActive: item.isActive ?? true
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number, e: React.MouseEvent): void => {
        e.stopPropagation();
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (deletingId) {
            try {
                const response = await vaultService.deleteCredentialVault({ id: deletingId });
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    getAllVaults();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } catch (err: any) {
                AlertMessages.getErrorMessage(err.message);
            }
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({
            appName: '',
            description: '',
            password: '',
            expireDate: '',
            owner: '',
            deviceSerialNumber: '',
            ipAddress: '',
            recoveryEmail: '',
            isActive: true
        });
    };

    const toggleReveal = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        AlertMessages.getSuccessMessage('Copied to clipboard!');
    };

    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return 'No expiry';
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="space-y-4">

            {filteredVaults.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-full">
                        <Key className="h-8 w-8 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black uppercase tracking-widest text-slate-900 dark:text-white text-xs">No Credentials Found</p>
                        <p className="text-[10px] text-slate-500 font-medium max-w-xs mx-auto">No secrets found matching your query.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 pb-12">
                    {filteredVaults.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[1rem] shadow-sm hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 p-3 overflow-hidden"
                        >
                            {/* Card Background Decoration */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-500">
                                <Key className="h-16 w-16 text-blue-500 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                                            <span className="text-[9px] font-black text-blue-600 uppercase">{item.appName?.charAt(0)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[9px] font-black text-slate-900 dark:text-white tracking-tight truncate uppercase leading-none">{item.appName}</h3>
                                            <p className="text-[7px] font-bold text-slate-400 truncate mt-0.5 italic">{item.description || 'Secret'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-1 py-0 rounded text-[7px] font-black uppercase tracking-wider border flex-shrink-0 ${item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                        {item.isActive ? 'active' : 'inactive'}
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-white/5 rounded p-2 space-y-1.5 border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center justify-between group/pw">
                                        <div className="space-y-0 text-[9px] font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider truncate mr-2">
                                            {revealedPasswords[item.id] ? item.password : '••••••••'}
                                        </div>
                                        <div className="flex items-center opacity-0 group-hover/pw:opacity-100 transition-opacity">
                                            <button onClick={(e) => toggleReveal(item.id, e)} className="p-0.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-all">
                                                {revealedPasswords[item.id] ? <EyeOff className="h-2 w-2" /> : <Eye className="h-2 w-2" />}
                                            </button>
                                            <button onClick={(e) => copyToClipboard(item.password, e)} className="p-0.5 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-all">
                                                <Copy className="h-2 w-2" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-200/50 dark:bg-white/5" />

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[7px] font-bold text-slate-500 leading-tight">
                                        <div className="flex flex-col">
                                            <span className="text-[6px] text-slate-400 uppercase tracking-tighter">Username</span>
                                            <span className="truncate text-slate-600 dark:text-slate-300">{item.owner || '-'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[6px] text-slate-400 uppercase tracking-tighter">Recovery Email</span>
                                            <span className="truncate text-slate-600 dark:text-slate-300">{item.recoveryEmail || '-'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[6px] text-slate-400 uppercase tracking-tighter">Serial Number</span>
                                            <span className="truncate text-slate-600 dark:text-slate-300">{item.deviceSerialNumber || '-'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[6px] text-slate-400 uppercase tracking-tighter">IP Address</span>
                                            <span className="truncate text-slate-600 dark:text-slate-300">{item.ipAddress || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-200/50 dark:bg-white/5" />

                                    <div className="flex items-center justify-between text-[7px] font-bold text-slate-400">
                                        <p>Expiry</p>
                                        <p>{formatDate(item.expireDate)}</p>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-0.5">
                                    <div className="flex items-center gap-0.5">
                                        <button onClick={(e) => handleEdit(item, e)} className="p-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-slate-400 hover:text-blue-600 transition-all">
                                            <Pencil className="h-2.5 w-2.5" />
                                        </button>
                                        <button onClick={(e) => handleDeleteClick(item.id, e)} className="p-0.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded text-slate-400 hover:text-rose-600 transition-all">
                                            <Trash2 className="h-2.5 w-2.5" />
                                        </button>
                                    </div>
                                    {item.description?.includes('http') && (
                                        <a href={item.description} target="_blank" rel="noopener noreferrer" className="p-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-500 hover:text-blue-600 transition-colors">
                                            <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Update Sentinel Secret" : "Seal New Credential"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Device / Application" value={formData.appName} onChange={(e) => setFormData({ ...formData, appName: e.target.value })} className="h-14" required />
                        <Input label="Username" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="h-14" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-14" required />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">Encrypted at rest</p>
                        </div>
                        <Input label="Recovery Email" value={formData.recoveryEmail} onChange={(e) => setFormData({ ...formData, recoveryEmail: e.target.value })} className="h-14" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Device Serial Number" value={formData.deviceSerialNumber} onChange={(e) => setFormData({ ...formData, deviceSerialNumber: e.target.value })} className="h-14" />
                        <Input label="IP Address" value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} className="h-14" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Expiry Date" type="date" value={formData.expireDate} onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })} className="h-14" />
                        <div className="flex items-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 h-14 translate-y-2">
                            <label className="flex items-center gap-3 cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 transition-all"
                                />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Active Access</span>
                            </label>
                        </div>
                    </div>

                    <Input label="Description / Security Notes" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-20" />

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                        <Button variant="outline" type="button" onClick={handleCloseModal} className="rounded-xl px-8 h-12 uppercase tracking-widest text-[10px] font-black">Cancel</Button>
                        <Button variant="primary" type="submit" className="rounded-xl px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 uppercase tracking-widest text-[10px] font-black">
                            {isEditMode ? 'Commit Changes' : 'Secure Credential'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={`${filteredVaults.find(v => v.id === deletingId)?.appName} Credential`}
            />
        </div>
    );
});

CredentialVaultMasterView.displayName = 'CredentialVaultMasterView';
