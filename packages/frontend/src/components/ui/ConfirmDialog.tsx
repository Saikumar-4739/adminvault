import React from 'react';
import { Modal } from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            button: 'danger' as const,
        },
        warning: {
            icon: 'text-yellow-500',
            button: 'primary' as const,
        },
        info: {
            icon: 'text-blue-500',
            button: 'primary' as const,
        },
    };

    const style = variantStyles[variant];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="flex flex-col items-center gap-4 py-4">
                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${style.icon}`}>
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <p className="text-center text-gray-700 dark:text-gray-300">
                    {message}
                </p>
                <div className="flex justify-center gap-3 pt-4 w-full">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        {cancelText}
                    </Button>
                    <Button variant={style.button} onClick={handleConfirm} className="flex-1">
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
