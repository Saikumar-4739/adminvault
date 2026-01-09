import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne
} from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { TicketsEntity } from './tickets.entity';
import { EmployeesEntity } from '../../employees/entities/employees.entity';

@Entity('ticket_work_logs')
export class TicketWorkLogEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'ticket_id' })
    ticketId: number;

    @ManyToOne(() => TicketsEntity)
    @JoinColumn({ name: 'ticket_id' })
    ticket: TicketsEntity;

    @Column('bigint', { name: 'technician_id' })
    technicianId: number;

    @ManyToOne(() => EmployeesEntity)
    @JoinColumn({ name: 'technician_id' })
    technician: EmployeesEntity;

    @Column('timestamp', { name: 'start_time' })
    startTime: Date;

    @Column('timestamp', { name: 'end_time', nullable: true })
    endTime: Date;

    @Column('int', { name: 'time_spent_minutes', default: 0 })
    timeSpentMinutes: number;

    @Column('text', { name: 'description' })
    description: string;
}
