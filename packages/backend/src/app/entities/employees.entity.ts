import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { EmployeeStatusEnum, DepartmentEnum } from '@adminvault/shared-models';

@Entity('employees')
@Index('idx_emp_email', ['email'])
@Index('idx_emp_dept', ['department'])
export class EmployeesEntity extends CommonBaseEntity {
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

