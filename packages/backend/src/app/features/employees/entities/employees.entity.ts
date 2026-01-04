import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeStatusEnum } from '@adminvault/shared-models';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('employees')
@Index('idx_emp_email', ['email'])
@Index('idx_emp_dept_id', ['departmentId'])
@Index('idx_emp_slack_id', ['slackUserId'])
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

  @Column('int', { name: 'department_id', nullable: false, comment: 'Department ID from departments master table' })
  departmentId: number;

  @Column('text', { name: 'remarks', nullable: true, comment: 'Additional remarks about employee' })
  remarks: string;

  @Column('varchar', { name: 'slack_user_id', length: 100, nullable: true, comment: 'Slack workspace user ID' })
  slackUserId: string;

  @Column('varchar', { name: 'slack_display_name', length: 255, nullable: true, comment: 'Display name in Slack' })
  slackDisplayName: string;

  @Column('varchar', { name: 'slack_avatar', length: 500, nullable: true, comment: 'Slack Avatar URL' })
  slackAvatar: string;

  @Column('boolean', { name: 'is_slack_active', default: false, nullable: false, comment: 'Whether slack user is active' })
  isSlackActive: boolean;
}

