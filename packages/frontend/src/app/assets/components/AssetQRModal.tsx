'use client';

import { useRef } from 'react';
import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal'
import { QRCodeSVG } from 'qrcode.react';


interface AssetQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: any;
    onPrint?: () => void;
}

export default function AssetQRModal({ isOpen, onClose, asset, onPrint }: AssetQRModalProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    if (!asset) return null;

    const qrValue = JSON.stringify({
        id: asset.id,
        sn: asset.serialNumber,
        model: asset.model
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Asset QR Code"
            size="sm"
        >
            <div className="flex flex-col items-center space-y-6 p-4">

                {/* Printable Area */}
                <div ref={componentRef} className="border-4 border-slate-900 p-4 rounded-lg bg-white w-64 h-auto text-center print:border-2 print:shadow-none print:m-0 print:w-full flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="my-2 p-2 bg-white">
                            <QRCodeSVG
                                value={qrValue}
                                size={128}
                                level="H"
                                includeMargin={false}
                            />
                        </div>

                        <div className="text-sm font-mono font-bold mt-2 text-slate-900">{asset.serialNumber}</div>
                        <div className="text-xs text-slate-500 font-medium">{asset.model}</div>
                    </div>
                </div>

                <div className="text-sm text-slate-500 text-center max-w-xs">
                    Scan this code to quickly access asset details, history, and assignment status.
                </div>

                <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1"
                        leftIcon={<Printer className="h-4 w-4" />}
                        onClick={onPrint}
                        disabled={!onPrint}
                    >
                        Print QR
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
