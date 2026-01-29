import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    action!: string;

    @Column()
    module!: string;

    @Column()
    performedBy!: string;

    @Column({ type: 'text', nullable: true })
    details!: string | null;

    @Column({ nullable: true })
    ipAddress!: string | null;

    @Column({ type: 'text', nullable: true })
    userAgent!: string | null;

    @Column({ type: 'json', nullable: true })
    requestPayload!: any;

    @CreateDateColumn()
    timestamp!: Date;
}
