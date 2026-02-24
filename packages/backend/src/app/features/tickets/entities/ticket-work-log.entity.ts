import { Column, Entity } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('ticket_work_logs')
export class TicketWorkLogEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'ticket_id', nullable: true })
    ticketId: number;

    @Column('bigint', { name: 'technician_id', nullable: true })
    technicianId: number;

    @Column('timestamp', { name: 'start_time' })
    startTime: Date;

    @Column('timestamp', { name: 'end_time', nullable: true })
    endTime: Date;

    @Column('int', { name: 'time_spent_minutes', default: 0 })
    timeSpentMinutes: number;

    @Column('text', { name: 'description' })
    description: string;
}
