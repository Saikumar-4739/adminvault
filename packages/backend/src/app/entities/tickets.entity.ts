import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@org/shared-models';

@Entity('tickets')
export class TicketsEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for tickets' })
    id: number;

    @Column('varchar', { name: 'ticket_code', length: 50, nullable: false, unique: true, comment: 'Unique ticket code' })
    ticketCode: string;

    @Column('bigint', { name: 'employee_id', nullable: false, comment: 'Reference to employees table' })
    employeeId: number;

    @Column('bigint', { name: 'assign_admin_id', nullable: true, comment: 'Reference to it_admin table' })
    assignAdminId: number;

    @Column('enum', { name: 'category_enum', enum: TicketCategoryEnum, nullable: false, comment: 'Ticket category' })
    categoryEnum: TicketCategoryEnum;

    @Column('enum', { name: 'priority_enum', enum: TicketPriorityEnum, nullable: false, comment: 'Ticket priority level' })
    priorityEnum: TicketPriorityEnum;

    @Column('text', { name: 'subject', nullable: false, comment: 'Ticket subject/description' })
    subject: string;

    @Column('enum', { name: 'ticket_status', enum: TicketStatusEnum, default: TicketStatusEnum.OPEN, nullable: false, comment: 'Current ticket status' })
    ticketStatus: TicketStatusEnum;

    @Column('timestamp', { name: 'resolved_at', nullable: true, comment: 'Timestamp when ticket was resolved' })
    resolvedAt: Date;
}
