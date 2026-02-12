'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Plus, Pencil, Trash2, ArrowLeft, LayoutDashboard, Settings2, ShieldCheck, Mail, Users, Laptop, ShoppingCart, Key, Network, CheckSquare, Ticket, PlusCircle, UserCircle, BookOpen } from 'lucide-react';
import { AlertMessages } from '@/lib/utils/AlertMessages';
import { iamService } from '@/lib/api/services';

const ICON_MAP: Record<string, any> = {
    LayoutDashboard, Settings2, ShieldCheck, Mail, Users, Laptop, ShoppingCart, Key, Network, CheckSquare, Ticket, PlusCircle, UserCircle, BookOpen
};

interface MenusMasterViewProps {
    onBack?: () => void;
    filter?: 'parent' | 'child';
}

export const MenusMasterView: React.FC<MenusMasterViewProps> = ({ onBack, filter }) => {
    const [menus, setMenus] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<{ id: number; label: string } | null>(null);
    const [formData, setFormData] = useState({ label: '', key: '', icon: '', displayOrder: 0, parentId: null as number | null, isActive: true });
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchMenus();
        }
    }, []);

    const fetchMenus = async (): Promise<void> => {
        try {
            const response = await iamService.getMenus();
            if (response.status) {
                setMenus(response.data || []);
            } else {
                AlertMessages.getErrorMessage(response.message);
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            if (isEditMode && editingMenuId) {
                const response = await iamService.updateMenu(editingMenuId, formData);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    fetchMenus();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } else {
                const response = await iamService.createMenu(formData);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    handleCloseModal();
                    fetchMenus();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            }
        } catch (error: any) {
            AlertMessages.getErrorMessage(error.message);
        }
    };

    const handleEdit = (menu: any): void => {
        setIsEditMode(true);
        setEditingMenuId(menu.id);
        setFormData({
            label: menu.label,
            key: menu.key,
            icon: menu.icon || '',
            displayOrder: menu.displayOrder || 0,
            parentId: menu.parentId || null,
            isActive: menu.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = (menu: any): void => {
        setMenuToDelete({ id: menu.id, label: menu.label });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async (): Promise<void> => {
        if (menuToDelete) {
            try {
                const response = await iamService.deleteMenu(menuToDelete.id);
                if (response.status) {
                    AlertMessages.getSuccessMessage(response.message);
                    setIsDeleteModalOpen(false);
                    setMenuToDelete(null);
                    fetchMenus();
                } else {
                    AlertMessages.getErrorMessage(response.message);
                }
            } catch (error: any) {
                AlertMessages.getErrorMessage(error.message);
            }
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingMenuId(null);
        setFormData({ label: '', key: '', icon: '', displayOrder: 0, parentId: null, isActive: true });
    };

    const renderMenuRows = (menuItems: any[], depth = 0, ignoreChildren = false): React.ReactNode[] => {
        return menuItems.flatMap((menu: any) => {
            const Icon = ICON_MAP[menu.icon] || Settings2;
            const rows: React.ReactNode[] = [(
                <tr key={menu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
                            <Icon className="h-4 w-4 text-slate-400" />
                            {menu.label}
                        </div>
                    </td>
                    <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{menu.key}</td>
                    <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">{menu.displayOrder}</td>
                    <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${menu.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800'
                            }`}>
                            {menu.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleEdit(menu)} className="h-7 w-7 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm" title="Edit">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(menu)} className="h-7 w-7 flex items-center justify-center rounded bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm" title="Delete">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            )];

            if (!ignoreChildren && menu.children && menu.children.length > 0) {
                rows.push(...renderMenuRows(menu.children, depth + 1));
            }

            return rows;
        });
    };

    return (
        <>
            <Card className="border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[700px] flex flex-col p-0 text-white">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">
                            {filter === 'parent' ? 'System Pages' : filter === 'child' ? 'Sub-Pages' : 'Pages & Sub-pages'}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Manage system navigation</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button size="xs" variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                                Back to Masters
                            </Button>
                        )}
                        <Button size="xs" variant="success" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                            Add Menu
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                    <div className="overflow-x-auto h-full">
                        <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Page Name</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Page Key</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Order</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Status</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900/50">
                                {(() => {
                                    let itemsToRender = menus || [];
                                    if (filter === 'parent') {
                                        itemsToRender = itemsToRender.filter(m => !m.parentId);
                                    } else if (filter === 'child') {
                                        // Flatten or just filter children? User likely wants a flat list or filtered tree.
                                        // Let's show all children flattened for easier sub-menu management.
                                        const flatten = (items: any[]): any[] => {
                                            return items.flatMap(item => [
                                                ...(item.parentId ? [item] : []),
                                                ...flatten(item.children || [])
                                            ]);
                                        };
                                        itemsToRender = flatten(menus || []);
                                    }

                                    if (itemsToRender.length === 0) {
                                        return <tr><td colSpan={5} className="p-8 text-center text-slate-500">No {filter || 'menus'} found</td></tr>;
                                    }
                                    return renderMenuRows(itemsToRender, 0, filter === 'child');
                                })()}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card >

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditMode ? "Edit Menu" : "Add Menu"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="h-14" required />
                        <Input label="Key (Unique)" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} className="h-14" required disabled={isEditMode} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Icon</label>
                            <select
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">Select Icon</option>
                                {Object.keys(ICON_MAP).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>
                        <Input label="Display Order" type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} className="h-14" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parent Menu (Optional)</label>
                        <select
                            value={formData.parentId || ''}
                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">None (Top Level)</option>
                            {menus.filter(m => !m.parentId && m.id !== editingMenuId).map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isActive" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName="Menu"
            />
        </>
    );
}
