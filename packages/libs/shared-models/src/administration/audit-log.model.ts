export interface AuditLogModel {
    id: string;
    action: string;
    module: string;
    performedBy: string;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    requestPayload?: any;
    timestamp: Date;
}
