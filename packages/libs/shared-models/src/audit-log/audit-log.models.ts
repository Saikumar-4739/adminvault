import { GlobalResponse } from '../common/global-response';

export class AuditLogModel {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    entityName?: string;
    actionUserId?: number;
    actionUserName?: string;
    actionUserEmail?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    module?: string;
    createdAt: Date;

    constructor(
        id: number,
        action: string,
        entityType: string,
        entityId: number,
        createdAt: Date,
        entityName?: string,
        actionUserId?: number,
        actionUserName?: string,
        actionUserEmail?: string,
        details?: Record<string, any>,
        ipAddress?: string,
        module?: string
    ) {
        this.id = id;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.entityName = entityName;
        this.actionUserId = actionUserId;
        this.actionUserName = actionUserName;
        this.actionUserEmail = actionUserEmail;
        this.details = details;
        this.ipAddress = ipAddress;
        this.module = module;
        this.createdAt = createdAt;
    }
}

export class GetAllAuditLogsResponseModel extends GlobalResponse {
    data: AuditLogModel[];

    constructor(status: boolean, code: number, message: string, data: AuditLogModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class GetAuditLogsRequestModel {
    entityType: string;
    entityId: number;

    constructor(entityType: string, entityId: number) {
        this.entityType = entityType;
        this.entityId = entityId;
    }
}
