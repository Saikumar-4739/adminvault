'use client';

import { useState, useEffect } from 'react';
import { documentsService } from '@/lib/api/services';
import { DocumentModel, UploadDocumentModel } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { FileText, Upload, Download, Trash2, Search, File, FolderOpen, HardDrive } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await documentsService.getAllDocuments();
            if (response.status) {
                setDocuments(response.documents);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const uploadModel: UploadDocumentModel = {
                originalName: selectedFile.name,
                fileSize: selectedFile.size,
                mimeType: selectedFile.type,
                category: category || undefined,
                description: description || undefined,
                companyId: 1,
                userId: 1
            };

            await documentsService.uploadDocument(selectedFile, uploadModel);
            setSelectedFile(null);
            setCategory('');
            setDescription('');
            fetchDocuments();
        } catch (error) {
            console.error('Failed to upload document:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                await documentsService.deleteDocument({ id, userId: 1 });
                fetchDocuments();
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
    };

    const handleDownload = (id: number) => {
        const url = documentsService.getDownloadUrl(id);
        window.open(url, '_blank');
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !filterCategory || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

    const stats = {
        total: documents.length,
        totalSize: (totalSize / (1024 * 1024)).toFixed(2),
        categories: categories.length,
    };

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                            Documents
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Upload and manage company documents
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Documents"
                        value={stats.total}
                        icon={File}
                        gradient="from-blue-500 to-cyan-600"
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Storage Used"
                        value={`${stats.totalSize} MB`}
                        icon={HardDrive}
                        gradient="from-violet-500 to-purple-600"
                        iconBg="bg-violet-50 dark:bg-violet-900/20"
                        iconColor="text-violet-600 dark:text-violet-400"
                        isLoading={isLoading}
                    />
                    <StatCard
                        title="Categories"
                        value={stats.categories}
                        icon={FolderOpen}
                        gradient="from-amber-500 to-orange-600"
                        iconBg="bg-amber-50 dark:bg-amber-900/20"
                        iconColor="text-amber-600 dark:text-amber-400"
                        isLoading={isLoading}
                    />
                </div>

                {/* Upload Section */}
                <Card className="p-6 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upload Document</h3>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {selectedFile ? selectedFile.name : 'Click to select a file or drag and drop'}
                                </p>
                            </label>
                        </div>
                        {selectedFile && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Category (optional)"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                />
                                <textarea
                                    placeholder="Description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                                />
                                <Button variant="primary" onClick={handleUpload} className="w-full shadow-lg shadow-indigo-500/20">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Document
                                </Button>
                            </>
                        )}
                    </div>
                </Card>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No documents found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDocuments.map((doc) => (
                            <Card key={doc.id} className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white dark:bg-slate-800">
                                <div className="h-24 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-90 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                                </div>

                                <div className="px-6 pb-6 relative">
                                    <div className="-mt-12 mb-4">
                                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                                            <div className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br from-blue-500 to-cyan-600">
                                                <FileText className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                                            {doc.originalName}
                                        </h3>
                                        {doc.category && (
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                                {doc.category}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                            {(doc.fileSize / 1024).toFixed(2)} KB
                                        </div>
                                        {doc.createdAt && (
                                            <div className="text-xs text-slate-500 dark:text-slate-500">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                            <button onClick={() => handleDownload(doc.id)} className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md text-slate-600 hover:text-emerald-600 transition-colors">
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-slate-600 hover:text-rose-600 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
