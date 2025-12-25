'use client';

// import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';
import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/modal';
// import ReactToPrint from 'react-to-print';

interface AssetQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: any; // Using any for simplicity as Asset generic type isn't exported easily, but should be stricter ideally
}

export default function AssetQRModal({ isOpen, onClose, asset }: AssetQRModalProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    if (!asset) return null;

    // const qrValue = `ASSET-${asset.id}-${asset.serialNumber}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Asset QR Code"
            size="sm"
        >
            <div className="flex flex-col items-center space-y-6 p-4">

                {/* Printable Area */}
                <div ref={componentRef} className="border-4 border-slate-900 p-4 rounded-lg bg-white w-64 h-auto text-center print:border-2 print:shadow-none print:m-0 print:w-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="font-bold text-lg uppercase tracking-wider mb-2">property of</div>
                        <h3 className="font-bold text-xl text-slate-900 mb-1">COMPANY ASSET</h3>

                        <div className="my-2">
                            {/* <QRCodeSVG
                                value={qrValue}
                                size={128}
                                level="H"
                                includeMargin={false}
                            /> */}
                            <div className="text-sm text-red-500">QR Code Disabled (Missing Dependency)</div>
                        </div>

                        <div className="text-sm font-mono font-bold mt-2">{asset.serialNumber}</div>
                        <div className="text-xs text-slate-500 font-medium">{asset.model}</div>
                        <div className="text-[10px] text-slate-400 mt-1">ID: {asset.id}</div>
                    </div>
                </div>

                <div className="text-sm text-slate-500 text-center max-w-xs">
                    Scan this code to quickly access asset details, history, and assignment status.
                </div>

                <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Close
                    </Button>

                    {/* <ReactToPrint
                        trigger={() => (
                            <Button variant="primary" className="flex-1" leftIcon={<Printer className="h-4 w-4" />}>
                                Print Label
                            </Button>
                        )}
                        content={() => componentRef.current}
                        pageStyle={`
                            @page {
                                size: auto;
                                margin: 0mm;
                            }
                            @media print {
                                body {
                                    -webkit-print-color-adjust: exact;
                                }
                            }
                        `}
                    /> */}
                    <Button variant="primary" className="flex-1" leftIcon={<Printer className="h-4 w-4" />} disabled>
                        Print (Disabled)
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
