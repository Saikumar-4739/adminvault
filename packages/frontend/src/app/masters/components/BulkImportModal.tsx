import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { configVariables } from '@adminvault/shared-services';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { success, error } = useToast();
    const { token } = useAuth(); // Assuming useAuth provides the token

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                setFile(droppedFile);
                setResult(null);
            } else {
                error('Please upload an Excel file');
            }
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using direct axios or a configured instance if available widely
            // Assuming BACKEND_URL is available via env or relative proxy
            const backendUrl = configVariables.APP_AVS_SERVICE_URL;

            const response = await axios.post(`${backendUrl}/masters/bulk-import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status) {
                setResult(response.data.data);
                success('Import process completed');
            } else {
                error(response.data.message || 'Import failed');
            }
        } catch (error: any) {
            console.error('Import error:', error);
            error(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const backendUrl = configVariables.APP_AVS_SERVICE_URL;
            const response = await axios.get(`${backendUrl}/masters/bulk-import/template`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'masters_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            success('Template downloaded successfully');
        } catch (err: any) {
            console.error('Download error:', err);
            error('Failed to download template');
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const handleClose = () => {
        reset();
        onClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Bulk Import Masters"
            size="lg"
            footer={
                !result && (
                    <>
                        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="ghost" onClick={handleDownloadTemplate} disabled={isLoading} className="mr-auto">
                            <Upload className="h-4 w-4 mr-2 rotate-180" /> Download Template
                        </Button>
                        <Button onClick={handleSubmit} disabled={!file || isLoading}>
                            {isLoading ? 'Importing...' : 'Import Data'}
                        </Button>
                    </>
                )
            }
        >
            <div className="space-y-6">
                {!result ? (
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${file ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <FileSpreadsheet className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={reset}>
                                    Remove File
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Excel files (.xlsx) only
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Import Summary
                            </h3>
                            <Button size="sm" onClick={reset}>
                                Import Another
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Brands Summary */}
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-3">Brands</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Success</span>
                                        <span className="font-bold text-green-600">{result.brands?.success || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Failed</span>
                                        <span className="font-bold text-red-600">{result.brands?.failed || 0}</span>
                                    </div>
                                </div>
                                {result.brands?.errors?.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-red-500 mb-2">Errors:</p>
                                        <ul className="text-xs text-red-500/80 space-y-1 max-h-32 overflow-y-auto">
                                            {result.brands.errors.map((err: string, i: number) => (
                                                <li key={i}>• {err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Departments Summary */}
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold text-sm mb-3">Departments</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Success</span>
                                        <span className="font-bold text-green-600">{result.departments?.success || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Failed</span>
                                        <span className="font-bold text-red-600">{result.departments?.failed || 0}</span>
                                    </div>
                                </div>
                                {result.departments?.errors?.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-red-500 mb-2">Errors:</p>
                                        <ul className="text-xs text-red-500/80 space-y-1 max-h-32 overflow-y-auto">
                                            {result.departments.errors.map((err: string, i: number) => (
                                                <li key={i}>• {err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        {result.others?.length > 0 && (
                            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                                <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Skipped Sheets
                                </h4>
                                <ul className="text-xs text-amber-600 dark:text-amber-500/80 space-y-1">
                                    {result.others.map((msg: string, i: number) => (
                                        <li key={i}>• {msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
