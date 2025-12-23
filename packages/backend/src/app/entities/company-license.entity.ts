import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { CompanyInfoEntity } from './company-info.entity';
import { ApplicationsMasterEntity } from './masters/application.entity';
import { EmployeesEntity } from './employees.entity';

@Entity('licenses')
@Index('idx_license_app', ['applicationId'])
@Index('idx_license_employee', ['assignedEmployeeId'])
@Index('idx_license_expiry', ['expiryDate'])
export class CompanyLicenseEntity extends CommonBaseEntity {

    @Column({ name: 'application_id', nullable: false })
    applicationId: number;

    @Column({ name: 'assigned_date', type: 'date', nullable: true })
    assignedDate: Date;

    @Column({ type: 'date', nullable: true })
    expiryDate: Date;

    @Column({ type: 'text', nullable: true })
    remarks: string;

    @ManyToOne(() => CompanyInfoEntity)
    @JoinColumn({ name: 'company_id' })
    company: CompanyInfoEntity;

    @ManyToOne(() => ApplicationsMasterEntity)
    @JoinColumn({ name: 'application_id' })
    application: ApplicationsMasterEntity;

    @Column({ name: 'assigned_employee_id', nullable: true })
    assignedEmployeeId: number;

    @ManyToOne(() => EmployeesEntity)
    @JoinColumn({ name: 'assigned_employee_id' })
    assignedEmployee: EmployeesEntity;
}
