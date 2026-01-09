import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { TicketCategoryEnum, TicketPriorityEnum, TicketStatusEnum } from '@adminvault/shared-models';

@Entity('tickets')
@Index('idx_ticket_emp', ['employeeId'])
@Index('idx_ticket_status', ['ticketStatus'])
@Index('idx_ticket_category', ['categoryEnum'])
@Index('idx_ticket_priority', ['priorityEnum'])
@Index('idx_ticket_assignee', ['assignAdminId'])
@Index('idx_ticket_code', ['ticketCode'])
@Index('idx_ticket_company', ['companyId'])
@Index('idx_ticket_user', ['userId'])
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

    @Column('text', { name: 'subject', nullable: false, comment: 'Ticket subject' })
    subject: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Detailed ticket description' })
    description: string;

    @Column('text', { name: 'response', nullable: true, comment: 'Admin response summary' })
    response: string;

    @Column('enum', { name: 'ticket_status', enum: TicketStatusEnum, default: TicketStatusEnum.OPEN, nullable: false, comment: 'Current ticket status' })
    ticketStatus: TicketStatusEnum;

    @Column('timestamp', { name: 'resolved_at', nullable: true, comment: 'Timestamp when ticket was resolved' })
    resolvedAt: Date;

    @Column('timestamp', { name: 'sla_deadline', nullable: true, comment: 'SLA deadline timestamp' })
    slaDeadline: Date;

    @Column('int', { name: 'time_spent_minutes', default: 0, comment: 'Total time spent by technicians in minutes' })
    timeSpentMinutes: number;
}
