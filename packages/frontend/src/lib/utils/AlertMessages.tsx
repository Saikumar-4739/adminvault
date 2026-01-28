import toast from 'react-hot-toast';
import React from 'react';

export class AlertMessages {
    static getErrorMessage(message: string | undefined | null) {
        toast.error(
            <div className="flex flex-col">
                <span className="font-bold">Error</span>
                {message && <span className="text-sm opacity-90 mt-1">{message}</span>}
            </div>,
            { position: 'top-center' }
        );
    }

    static getSuccessMessage(message: string | undefined | null) {
        toast.success(
            <div className="flex flex-col">
                <span className="font-bold">Success</span>
                {message && <span className="text-sm opacity-90 mt-1">{message}</span>}
            </div>,
            { position: 'top-center' }
        );
    }

    static getWarningMessage(message: string | undefined | null) {
        toast(
            <div className="flex flex-col">
                <span className="font-bold">Warning</span>
                {message && <span className="text-sm opacity-90 mt-1">{message}</span>}
            </div>,
            { position: 'top-center', icon: '⚠️' }
        );
    }

    static getInfoMessage(message: string | undefined | null) {
        toast(
            <div className="flex flex-col">
                <span className="font-bold">Info</span>
                {message && <span className="text-sm opacity-90 mt-1">{message}</span>}
            </div>,
            { position: 'top-center', icon: 'ℹ️' }
        );
    }
}
