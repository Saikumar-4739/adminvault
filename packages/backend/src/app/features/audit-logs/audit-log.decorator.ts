import { SetMetadata } from '@nestjs/common';

export const REFLECTOR_AUDIT_LOG_KEY = 'audit_log_metadata';

export interface AuditLogMetadata {
    module: string;
    action: string;
    includeResult?: boolean; // Option to include result details in the log
}

export const AuditLog = (metadata: AuditLogMetadata) => SetMetadata(REFLECTOR_AUDIT_LOG_KEY, metadata);
