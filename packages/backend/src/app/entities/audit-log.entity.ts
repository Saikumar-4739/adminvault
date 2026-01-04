import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'action', type: 'varchar', length: 100 })
    action: string;

    @Column({ name: 'resource', type: 'varchar', length: 100, nullable: true })
    resource: string;

    @Column({ name: 'details', type: 'text', nullable: true })
    details: string;

    @Column({ name: 'status', type: 'varchar', length: 50, default: 'SUCCESS' })
    status: string;

    @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
    ipAddress: string;

    @Column({ name: 'company_id', type: 'bigint', default: 1 })
    companyId: number;

    @Column({ name: 'user_id', type: 'bigint', nullable: true })
    userId: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
