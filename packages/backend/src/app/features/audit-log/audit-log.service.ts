import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogModel, GetAllAuditLogsResponseModel, GlobalResponse } from '@adminvault/shared-models';
import { returnException } from '@adminvault/backend-utils';

@Injectable()
export class AuditLogService {
    constructor(private repository: AuditLogRepository) { }

    async logAction(
        action: string,
        entityType: string,
        entityId: number,
        entityName: string,
        userId: number,
        userName: string,
        userEmail: string,
        details: Record<string, any>,
        ipAddress: string,
        module: string
    ): Promise<GlobalResponse> {
        try {
            const auditLog = new AuditLogEntity();
            auditLog.action = action;
            auditLog.entityType = entityType;
            auditLog.entityId = entityId;
            auditLog.entityName = entityName;
            auditLog.actionUserId = userId;
            auditLog.actionUserName = userName;
            auditLog.actionUserEmail = userEmail;
            auditLog.details = details;
            auditLog.ipAddress = ipAddress;
            auditLog.module = module;

            await this.repository.save(auditLog);
            return new GlobalResponse(true, 200, 'Action logged successfully');
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    private mapToModel(log: AuditLogEntity): AuditLogModel {
        return new AuditLogModel(
            Number(log.id),
            log.action,
            log.entityType,
            Number(log.entityId),
            log.createdAt,
            log.entityName,
            Number(log.actionUserId),
            log.actionUserName,
            log.actionUserEmail,
            log.details,
            log.ipAddress,
            log.module
        );
    }

    async getAllLogs(): Promise<GetAllAuditLogsResponseModel> {
        try {
            const logs = await this.repository.find({
                order: { createdAt: 'DESC' },
                take: 100
            });
            const data = logs.map(log => this.mapToModel(log));
            return new GetAllAuditLogsResponseModel(true, 200, 'Logs fetched successfully', data);
        } catch (error) {
            return returnException(GetAllAuditLogsResponseModel, error);
        }
    }

    async getLogsByEntity(entityType: string, entityId: number): Promise<GetAllAuditLogsResponseModel> {
        try {
            const logs = await this.repository.find({
                where: { entityType, entityId },
                order: { createdAt: 'DESC' }
            });
            const data = logs.map(log => this.mapToModel(log));
            return new GetAllAuditLogsResponseModel(true, 200, 'Logs fetched successfully', data);
        } catch (error) {
            return returnException(GetAllAuditLogsResponseModel, error);
        }
    }
}
