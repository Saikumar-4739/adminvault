'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Modal } from '@/components/ui/modal';
import { Building2, Users, Package, Smartphone, Monitor, ShoppingBag, Briefcase, Tags, Plus, Pencil, Trash2 } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useMasters } from '@/hooks/useMasters';
import { PageLoader } from '@/components/ui/Spinner';

export default function MastersPage() {
    const [activeTab, setActiveTab] = useState('companies');
    const {
        departments, fetchDepartments, createDepartment, deleteDepartment,
        assetTypes, fetchAssetTypes, createAssetType, deleteAssetType,
        brands, fetchBrands, createBrand, deleteBrand,
        vendors, fetchVendors, createVendor, deleteVendor,
        locations, fetchLocations, createLocation, deleteLocation,
        ticketCategories, fetchTicketCategories, createTicketCategory, deleteTicketCategory,
        isLoading: mastersLoading
    } = useMasters();

    const tabs = [
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'departments', label: 'Departments', icon: Users },
        { id: 'asset-types', label: 'Asset Types', icon: Monitor },
        { id: 'device-brands', label: 'Device Brands', icon: Smartphone },
        { id: 'vendors', label: 'Vendors', icon: ShoppingBag },
        { id: 'ticket-categories', label: 'Ticket Categories', icon: Tags },
    ];

    // Fetch data when tab changes
    useEffect(() => {
        switch (activeTab) {
            case 'departments': fetchDepartments(); break;
            case 'asset-types': fetchAssetTypes(); break;
            case 'device-brands': fetchBrands(); break;
            case 'vendors': fetchVendors(); break;
            case 'locations': fetchLocations(); break;
            case 'ticket-categories': fetchTicketCategories(); break;
        }
    }, [activeTab, fetchDepartments, fetchAssetTypes, fetchBrands, fetchVendors, fetchLocations, fetchTicketCategories]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Masters</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Manage core system data and configurations
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-lg text-xs font-medium transition-all duration-200 border ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border-indigo-600'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <Icon className="h-5 w-5 mb-0.5" />
                            <span className="truncate w-full text-center">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'companies' && <CompaniesMasterView />}
                {activeTab === 'departments' && <GenericMasterView title="Departments" data={departments} onDelete={deleteDepartment} onCreate={createDepartment} type="department" isLoading={mastersLoading} />}
                {activeTab === 'asset-types' && <GenericMasterView title="Asset Types" data={assetTypes} onDelete={deleteAssetType} onCreate={createAssetType} type="asset-type" isLoading={mastersLoading} />}
                {activeTab === 'device-brands' && <GenericMasterView title="Device Brands" data={brands} onDelete={deleteBrand} onCreate={createBrand} type="brand" isLoading={mastersLoading} />}
                {activeTab === 'vendors' && <GenericMasterView title="Vendors" data={vendors} onDelete={deleteVendor} onCreate={createVendor} type="vendor" isLoading={mastersLoading} />}
                {activeTab === 'locations' && <GenericMasterView title="Locations" data={locations} onDelete={deleteLocation} onCreate={createLocation} type="location" isLoading={mastersLoading} />}
                {activeTab === 'ticket-categories' && <GenericMasterView title="Ticket Categories" data={ticketCategories} onDelete={deleteTicketCategory} onCreate={createTicketCategory} type="ticket-category" isLoading={mastersLoading} />}
            </div>
        </div>
    );
}

function CompaniesMasterView() {
    const { companies, isLoading, createCompany } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        location: '',
        estDate: '',
        email: '',
        phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createCompany({
            companyName: formData.companyName,
            location: formData.location,
            estDate: new Date(formData.estDate),
            email: formData.email || undefined,
            phone: formData.phone || undefined
        });
        if (success) {
            setIsModalOpen(false);
            setFormData({ companyName: '', location: '', estDate: '', email: '', phone: '' });
        }
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Registered Companies ({companies?.length || 0})</h3>
                    <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                        Add Company
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                    {isLoading ? (
                        <PageLoader />
                    ) : (
                        <div className="overflow-x-auto h-full">
                            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">ID</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Company Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">City/Location</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Email</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {companies.map((c, i) => (
                                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{i + 1}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{c.companyName}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{c.location || '-'}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{c.email || '-'}</td>
                                            <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                <div className="flex justify-center gap-2">
                                                    <button className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Company">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Company Name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                    <Input
                        label="Establishment Date"
                        type="date"
                        value={formData.estDate}
                        onChange={(e) => setFormData({ ...formData, estDate: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create Company</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

function GenericMasterView({ title, data, onDelete, onCreate, type, isLoading }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({ name: '', description: '', code: '', level: '', contactPerson: '', email: '', address: '', city: '', country: '', website: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreate(formData);
        setIsModalOpen(false);
        setFormData({ name: '', description: '', code: '', level: '', contactPerson: '', email: '', address: '', city: '', country: '', website: '' });
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this item?')) await onDelete(id);
    };

    return (
        <>
            <Card className="border-none shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden h-[600px] flex flex-col p-0">
                <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 mb-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{title} List ({data?.length || 0})</h3>
                    <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                        Add {title.slice(0, -1)}
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-4">
                    {isLoading ? (
                        <PageLoader />
                    ) : (
                        <div className="overflow-x-auto h-full">
                            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Sno</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Name</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Info</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-slate-200 dark:border-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900">
                                    {data?.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-500">No records found</td></tr> :
                                        data?.map((item: any, index: number) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">{index + 1}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm text-slate-500">
                                                    {item.code || item.level || item.description || item.contactPerson || item.website || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center border border-slate-200 dark:border-slate-700 text-sm">
                                                    <div className="flex justify-center gap-2">
                                                        <button className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${title.slice(0, -1)}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

                    {type === 'department' && <Input label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />}
                    {type === 'designation' && <Input label="Level" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} />}
                    {type === 'vendor' && (
                        <>
                            <Input label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
                            <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </>
                    )}
                    {type === 'location' && (
                        <>
                            <Input label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                            <Input label="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                        </>
                    )}
                    {type === 'brand' && <Input label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
