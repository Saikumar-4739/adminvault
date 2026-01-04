import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';

@Entity('tickets')
@Index('idx_ticket_emp', ['employeeId'])
@Index('idx_ticket_status', ['ticketStatus'])
@Index('idx_ticket_category', ['categoryEnum'])
@Index('idx_ticket_priority', ['priorityEnum'])
@Index('idx_ticket_assignee', ['assignAdminId'])
export class TicketsEntity extends CommonBaseEntity {
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
