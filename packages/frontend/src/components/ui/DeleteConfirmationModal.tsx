'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Item',
    description = 'Are you sure you want to delete this item? This action cannot be undone.',
    itemName,
    isDeleting = false
}: DeleteConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
            <div className="p-4 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {itemName ? `Delete "${itemName}"?` : title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        isLoading={isDeleting}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
