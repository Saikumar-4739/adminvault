import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';

@EventSubscriber()
@Injectable()
export class AuditLogSubscriber implements EntitySubscriberInterface {
    constructor(
        @InjectDataSource() readonly dataSource: DataSource
    ) {
        console.log('AuditLogSubscriber Initialized!');
        dataSource.subscribers.push(this);
    }

    // Capture all changes
    listenTo() {
        return 'everything';
    }

    async afterInsert(event: InsertEvent<any>) {
        if (!this.shouldLog(event.metadata.tableName)) return;

        console.log('AuditLog: Insert detected!', event.metadata.tableName);
        const audit = new AuditLogEntity();
        audit.action = 'INSERT';
        audit.entityName = event.metadata.tableName;
        audit.entityId = this.getEntityId(event.entity);
        audit.newData = event.entity;

        // Best effort to get context
        audit.userId = event.entity.userId || null;
        audit.companyId = event.entity.companyId || null;

        await this.saveAudit(audit, event.manager);
    }

    async afterUpdate(event: UpdateEvent<any>) {
        if (!this.shouldLog(event.metadata.tableName)) return;

        console.log('AuditLog: Update detected!', event.metadata.tableName);
        const audit = new AuditLogEntity();
        audit.action = 'UPDATE';
        audit.entityName = event.metadata.tableName;
        audit.entityId = this.getEntityId(event.databaseEntity || event.entity);

        // Calculate diff
        const originalData = event.databaseEntity || {};
        const newData = event.entity || {}; // Contains only updated columns

        // Store meaningful changes only
        audit.originalData = originalData;
        audit.newData = newData; // This shows strictly what changed

        // Best effort to get context
        // If userId/companyId was updated, use new. Else use original.
        audit.userId = newData.userId || originalData.userId || null;
        audit.companyId = newData.companyId || originalData.companyId || null;

        await this.saveAudit(audit, event.manager);
    }

    async afterRemove(event: RemoveEvent<any>) {
        if (!this.shouldLog(event.metadata.tableName)) return;

        console.log('AuditLog: Remove detected!', event.metadata.tableName);
        const audit = new AuditLogEntity();
        audit.action = 'DELETE';
        audit.entityName = event.metadata.tableName;
        audit.entityId = this.getEntityId(event.entity || event.databaseEntity);
        audit.originalData = event.entity || event.databaseEntity;

        // Best effort to get context
        const entity = event.entity || event.databaseEntity;
        audit.userId = entity?.userId || null;
        audit.companyId = entity?.companyId || null;

        await this.saveAudit(audit, event.manager);
    }

    private shouldLog(tableName: string): boolean {
        // Prevent infinite loops by not logging changes to the audit_logs table
        if (tableName === 'audit_logs') return false;
        // Optional: Exclude other technical tables like migrations
        if (tableName === 'migrations') return false;
        return true;
    }

    private getEntityId(entity: any): string {
        if (!entity) return 'unknown';
        return String(entity.id || 'unknown');
    }

    private async saveAudit(audit: AuditLogEntity, manager: EntityManager) {
        try {
            // Use the transaction manager
            await manager.save(AuditLogEntity, audit);
        } catch (error) {
            console.error('Failed to save audit log:', error);
            // Don't fail the main transaction
        }
    }
}
