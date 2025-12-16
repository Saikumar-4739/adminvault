import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { EmployeeStatusEnum, DepartmentEnum } from '@adminvault/shared-models';

@Entity('employees')
export class EmployeesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for employees' })
  id: number;

  @Column('bigint', { name: 'company_id', nullable: false, comment: 'Reference to company_info table' })
  companyId: number;

  @Column('varchar', { name: 'first_name', length: 100, nullable: false, comment: 'Employee first name' })
  firstName: string;

  @Column('varchar', { name: 'last_name', length: 100, nullable: false, comment: 'Employee last name' })
  lastName: string;

  @Column('varchar', { name: 'email', length: 255, nullable: false, comment: 'Employee email address' })
  email: string;

  @Column('varchar', { name: 'ph_number', length: 20, nullable: true, comment: 'Employee phone number' })
  phNumber: string;

  @Column('enum', { name: 'emp_status', enum: EmployeeStatusEnum, default: EmployeeStatusEnum.ACTIVE, nullable: false, comment: 'Employee employment status' })
  empStatus: EmployeeStatusEnum;

  @Column('decimal', { name: 'billing_amount', precision: 10, scale: 2, nullable: true, comment: 'Employee billing amount' })
  billingAmount: number;

  @Column('enum', { name: 'department', enum: DepartmentEnum, nullable: false, comment: 'Employee department' })
  department: DepartmentEnum;

  @Column('text', { name: 'remarks', nullable: true, comment: 'Additional remarks about employee' })
  remarks: string;
}

