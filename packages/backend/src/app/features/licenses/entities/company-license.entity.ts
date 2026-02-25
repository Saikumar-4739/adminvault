import { Entity, Column, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('licenses')
@Index('idx_license_app', ['applicationId'])
@Index('idx_license_user', ['userId'])
export class CompanyLicenseEntity extends CommonBaseEntity {

    @Column({ name: 'application_id', nullable: false })
    applicationId: number;

    @Column({ name: 'assigned_date', type: 'date', nullable: true })
    assignedDate: Date | null;

    @Column({ type: 'date', nullable: true })
    expiryDate: Date | null;

    @Column({ type: 'text', nullable: true })
    remarks: string | null;

    @Column({ name: 'assigned_employee_id', nullable: true })
    assignedEmployeeId: number;

    @Column({ name: 'total_seats', type: 'int', default: 1 })
    totalSeats: number;

    @Column({ name: 'cost_per_seat', type: 'decimal', precision: 12, scale: 2, default: 0 })
    costPerSeat: number;

    @Column({ name: 'billing_cycle', length: 50, default: 'MONTHLY' })
    billingCycle: string; // MONTHLY, YEARLY, ONE_TIME
}
