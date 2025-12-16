import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EmailTypeEnum, DepartmentEnum } from '@adminvault/shared-models';

@Entity('email_info')
export class EmailInfoEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for email info' })
  id: number;

  @Column('bigint', { name: 'company_id', nullable: false, comment: 'Reference to company_info table' })
  companyId: number;

  @Column('enum', { name: 'email_type', enum: EmailTypeEnum, nullable: false, comment: 'Type of email' })
  emailType: EmailTypeEnum;

  @Column('enum', { name: 'department', enum: DepartmentEnum, nullable: false, comment: 'Department associated with email' })
  department: DepartmentEnum;

  @Column('varchar', { name: 'email', length: 255, nullable: false, comment: 'Email address' })
  email: string;

  @Column('bigint', { name: 'employee_id', nullable: true, comment: 'Reference to employees table' })
  employeeId: number;
}

