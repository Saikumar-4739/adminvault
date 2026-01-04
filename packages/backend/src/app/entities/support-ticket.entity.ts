import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyInfoEntity } from './company-info.entity';
import { AuthUsersEntity } from './auth-users.entity';

export enum SupportTicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum SupportCategory {
    TECHNICAL = 'TECHNICAL',
    BILLING = 'BILLING',
    FEATURE_REQUEST = 'FEATURE_REQUEST',
    BUG_REPORT = 'BUG_REPORT',
    GENERAL = 'GENERAL',
}

@Entity('support_tickets')
export class SupportTicketEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Primary key for support tickets' })
    id: number;

    @Column({ name: 'subject', type: 'varchar', length: 255, comment: 'Ticket subject' })
    subject: string;

    @Column({ name: 'description', type: 'text', comment: 'Detailed description' })
    description: string;

    @Column({
        name: 'category',
        type: 'enum',
        enum: SupportCategory,
        default: SupportCategory.GENERAL,
        comment: 'Ticket category',
    })
    category: SupportCategory;

    @Column({
        name: 'priority',
        type: 'enum',
        enum: SupportTicketPriority,
        default: SupportTicketPriority.MEDIUM,
        comment: 'Ticket priority',
    })
    priority: SupportTicketPriority;

    @Column({
        name: 'status',
        type: 'enum',
        enum: SupportTicketStatus,
        default: SupportTicketStatus.OPEN,
        comment: 'Ticket status',
    })
    status: SupportTicketStatus;

    @Column({ name: 'company_id', type: 'bigint', comment: 'Company ID' })
    companyId: number;

    @ManyToOne(() => CompanyInfoEntity)
    @JoinColumn({ name: 'company_id' })
    company: CompanyInfoEntity;

    @Column({ name: 'created_by', type: 'bigint', comment: 'User who created the ticket' })
    createdBy: number;

    @ManyToOne(() => AuthUsersEntity)
    @JoinColumn({ name: 'created_by' })
    creator: AuthUsersEntity;

    @Column({ name: 'assigned_to', type: 'bigint', nullable: true, comment: 'Support agent assigned' })
    assignedTo: number;

    @ManyToOne(() => AuthUsersEntity)
    @JoinColumn({ name: 'assigned_to' })
    assignee: AuthUsersEntity;

    @Column({ name: 'response', type: 'text', nullable: true, comment: 'Support response' })
    response: string;

    @Column({ name: 'resolved_at', type: 'timestamp', nullable: true, comment: 'Resolution timestamp' })
    resolvedAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Last update timestamp' })
    updatedAt: Date;
}
