import { ConfirmDialog } from './ConfirmDialog';
import React from 'react';

export interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string; // e.g. "User", "Document", "Role"
    message?: string; // Custom message to potentially override the default
    isDeleting?: boolean; // To show loading state on the delete button
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    message,
    isDeleting = false
}: DeleteConfirmDialogProps) {
    const displayMessage = message || `Are you sure you want to delete this ${itemName || 'item'}? This action cannot be undone.`;

    // We might need to extend ConfirmDialog to support isLoading if it doesn't already.
    // Looking at ConfirmDialog from previous steps, it doesn't seem to pass isLoading to Button.
    // However, for now, let's just stick to the basic props.

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Confirmation"
            message={displayMessage}
            confirmText={isDeleting ? "Deleting..." : "Delete"}
            variant="danger"
        />
    );
}
