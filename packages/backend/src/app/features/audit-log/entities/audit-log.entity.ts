import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('audit_logs')
@Index('idx_audit_entity', ['entityType', 'entityId'])
@Index('idx_audit_user', ['actionUserId'])
@Index('idx_audit_action', ['action'])
@Index('idx_audit_created', ['createdAt'])
export class AuditLogEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'action', length: 100, nullable: false, comment: 'Action performed (CREATE, UPDATE, DELETE, ASSIGN, etc.)' })
    action: string;

    @Column('varchar', { name: 'entity_type', length: 100, nullable: false, comment: 'Type of entity (ASSET, TICKET, EMPLOYEE, LICENSE, etc.)' })
    entityType: string;

    @Column('bigint', { name: 'entity_id', nullable: true, comment: 'ID of the affected entity' })
    entityId: number;

    @Column('varchar', { name: 'entity_name', length: 255, nullable: true, comment: 'Name/identifier of the affected entity' })
    entityName: string;

    @Column('bigint', { name: 'action_user_id', nullable: true, comment: 'ID of the user who performed the action' })
    actionUserId: number;

    @Column('varchar', { name: 'action_user_name', length: 255, nullable: true, comment: 'Name of the user who performed the action' })
    actionUserName: string;

    @Column('varchar', { name: 'action_user_email', length: 255, nullable: true, comment: 'Email of the user who performed the action' })
    actionUserEmail: string;

    @Column('jsonb', { name: 'details', nullable: true, comment: 'Additional details about the action (old/new values)' })
    details: Record<string, any>;

    @Column('varchar', { name: 'ip_address', length: 50, nullable: true, comment: 'IP address of the user' })
    ipAddress: string;

    @Column('varchar', { name: 'module', length: 100, nullable: true, comment: 'Module where the action occurred' })
    module: string;
}
