import { Entity, Column, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('licenses')
@Index('idx_license_app', ['applicationId'])
@Index('idx_license_employee', ['assignedEmployeeId'])
@Index('idx_license_expiry', ['expiryDate'])
@Index('idx_license_company', ['companyId'])
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

}
