import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { EmailTypeEnum, DepartmentEnum } from '@adminvault/shared-models';

@Entity('email_info')
@Index('idx_email_info_dept', ['department'])
@Index('idx_email_info_type', ['emailType'])
export class EmailInfoEntity extends CommonBaseEntity {
  @Column('enum', { name: 'email_type', enum: EmailTypeEnum, nullable: false, comment: 'Type of email' })
  emailType: EmailTypeEnum;

  @Column('enum', { name: 'department', enum: DepartmentEnum, nullable: false, comment: 'Department associated with email' })
  department: DepartmentEnum;

  @Column('varchar', { name: 'email', length: 255, nullable: false, comment: 'Email address' })
  email: string;

  @Column('bigint', { name: 'employee_id', nullable: true, comment: 'Reference to employees table' })
  employeeId: number;
}

