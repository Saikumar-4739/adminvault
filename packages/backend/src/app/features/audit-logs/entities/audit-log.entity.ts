import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_entity', ['entityName', 'entityId'])
@Index('idx_audit_user', ['userId'])
@Index('idx_audit_company', ['companyId'])
@Index('idx_audit_created', ['createdAt'])
export class AuditLogEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'user_id', type: 'bigint', nullable: true })
    userId: number;

    @Column({ name: 'company_id', type: 'bigint', nullable: true })
    companyId: number;

    @Column({ name: 'entity_name', type: 'varchar', length: 100 })
    entityName: string;

    @Column({ name: 'entity_id', type: 'varchar', length: 50 })
    entityId: string;

    @Column({ name: 'action', type: 'varchar', length: 20 })
    action: string; // INSERT, UPDATE, DELETE

    @Column({ name: 'original_data', type: 'json', nullable: true })
    originalData: any;

    @Column({ name: 'new_data', type: 'json', nullable: true })
    newData: any;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
