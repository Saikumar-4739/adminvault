'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { documentsService } from '@/lib/api/services';
import { DocumentModel, UploadDocumentModel } from '@adminvault/shared-models';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FileText, Upload, Download, Trash2, Search, File, FolderOpen, HardDrive, FileSpreadsheet, Image as ImageIcon, FileCode, FileArchive, Plus } from 'lucide-react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRoleEnum } from '@adminvault/shared-models';
import { Modal } from '@/components/ui/Modal';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocuments = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;

        try {
            const uploadModel: UploadDocumentModel = {
                originalName: selectedFile.name,
                fileSize: selectedFile.size,
                mimeType: selectedFile.type,
                category: category || undefined,
                description: description || undefined,
                tags: tags || undefined,
                companyId: 1,
                userId: 1
            };

            await documentsService.uploadDocument(selectedFile, uploadModel);
            setSelectedFile(null);
            setCategory('');
            setDescription('');
            setTags('');
            setIsUploadModalOpen(false);
            fetchDocuments();
        } catch (error) {
            console.error('Failed to upload document:', error);
        }
    }, [selectedFile, category, description, tags, fetchDocuments]);

    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const getFileIcon = useCallback((mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-rose-500" />;
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv'))
            return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
        if (mimeType.includes('image')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
        if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('html'))
            return <FileCode className="h-5 w-5 text-amber-500" />;
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive'))
            return <FileArchive className="h-5 w-5 text-purple-500" />;
        return <File className="h-5 w-5 text-slate-400" />;
    }, []);

    const handleDelete = useCallback(async (id: number) => {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                await documentsService.deleteDocument({ id, userId: 1 });
                fetchDocuments();
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
    }, [fetchDocuments]);

    const handleDownload = useCallback((id: number) => {
        const url = documentsService.getDownloadUrl(id);
        window.open(url, '_blank');
    }, []);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            return doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [documents, searchQuery]);

    const categories = useMemo(() => {
        return Array.from(new Set(documents.map(d => d.category).filter(Boolean)));
    }, [documents]);

    const stats = useMemo(() => {
        const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
        return {
            total: documents.length,
            totalSize: (totalSize / (1024 * 1024)).toFixed(2),
            categories: categories.length,
        };
    }, [documents, categories]);

    return (
        <RouteGuard requiredRoles={[UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]}>
            <div className="p-6 space-y-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Hub</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Manage your enterprise assets</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search repository..."
                                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm w-full sm:w-[220px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="primary"
                            leftIcon={<Plus className="h-4 w-4" />}
                            onClick={() => setIsUploadModalOpen(true)}
                        >
                            Add New
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <File className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Assets</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">{stats.total}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                            <HardDrive className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Storage Usage</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">{stats.totalSize} MB</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                            <FolderOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Categories</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">{stats.categories}</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No documents found</h3>
                        <p className="text-slate-500 text-sm mt-1">Upload your first document to get started.</p>
                    </div>
                ) : (
                    <Card className="overflow-hidden border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-3">File Asset</th>
                                        <th className="px-6 py-3">Details</th>
                                        <th className="px-6 py-3">Storage</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredDocuments.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-all group border-b border-slate-100 dark:border-slate-700 last:border-0">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-all duration-300">
                                                        {getFileIcon(doc.mimeType)}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-xs text-sm tracking-tight">
                                                            {doc.originalName}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                                                            <span>{formatFileSize(doc.fileSize)}</span>
                                                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                            <span>{doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {doc.category && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                                                            {doc.category}
                                                        </span>
                                                    )}
                                                    {doc.tags?.split(',').slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                                                            #{tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="space-y-0.5">
                                                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        }) : 'N/A'}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">
                                                        Vault Entry
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="p-1.5 hover:bg-emerald-600 hover:text-white rounded-lg text-slate-400 transition-all"
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-1.5 hover:bg-rose-600 hover:text-white rounded-lg text-slate-400 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Upload Modal */}
                <Modal
                    isOpen={isUploadModalOpen}
                    onClose={() => {
                        setIsUploadModalOpen(false);
                        setSelectedFile(null);
                        setCategory('');
                        setDescription('');
                        setTags('');
                    }}
                    title="Upload New Document"
                    size="lg"
                >
                    <div className="space-y-6 pt-2">
                        <div
                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 ${selectedFile
                                ? 'border-emerald-500/50 bg-emerald-50/10'
                                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                                }`}
                            onClick={() => document.getElementById('file-upload-modal')?.click()}
                        >
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload-modal"
                            />
                            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 ${selectedFile ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 scale-110' : 'bg-white dark:bg-slate-800 text-slate-400 shadow-sm'}`}>
                                <Upload className="h-8 w-8" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                {selectedFile ? 'File Selected' : 'Choose a file to upload'}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {selectedFile ? selectedFile.name : 'Click here or drag and drop any document'}
                            </p>
                            {selectedFile && (
                                <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    {formatFileSize(selectedFile.size)}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Legal, Finance, HR"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Tags</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2024, confidential"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                            <textarea
                                placeholder="What is this document about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsUploadModalOpen(false);
                                    setSelectedFile(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className="shadow-lg shadow-indigo-500/20 px-8"
                            >
                                Start Upload
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </RouteGuard>
    );
};


