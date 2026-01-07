import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { EmailTypeEnum, EmailStatusEnum } from '@adminvault/shared-models';

@Entity('email_info')
@Index('idx_email_info_dept', ['department'])
@Index('idx_email_info_type', ['emailType'])
@Index('idx_email_info_status', ['status'])
@Index('idx_email_info_employee', ['employeeId'])
export class EmailInfoEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'Email address' })
    email: string;

    @Column('enum', { name: 'email_type', enum: EmailTypeEnum, nullable: false, comment: 'Type of email' })
    emailType: EmailTypeEnum;

    @Column('varchar', { name: 'department', length: 255, nullable: true, comment: 'Department associated with email' })
    department: string;

    @Column('bigint', { name: 'employee_id', nullable: true, comment: 'Reference to employees table' })
    employeeId: number;

    @Column('enum', { name: 'status', enum: EmailStatusEnum, default: EmailStatusEnum.ACTIVE, nullable: false, comment: 'Email account status' })
    status: EmailStatusEnum;
}
