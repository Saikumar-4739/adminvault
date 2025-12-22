import { Column, Entity, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { EmailTypeEnum, EmailStatusEnum } from '@adminvault/shared-models';
import { CommonBaseEntity } from './common-base.entity';

@Entity('email_accounts')
@Index('idx_email_acc_employee', ['employeeId'])
@Index('idx_email_acc_type', ['emailType'])
@Index('idx_email_acc_status', ['status'])
export class EmailAccountsEntity extends CommonBaseEntity {

    @Column('bigint', { name: 'employee_id', nullable: true, comment: 'Reference to employees table' })
    employeeId: number | null;

    @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'Email address' })
    email: string;

    @Column('enum', { name: 'email_type', enum: EmailTypeEnum, nullable: false, comment: 'Type of email account' })
    emailType: EmailTypeEnum;

    @Column('enum', { name: 'status', enum: EmailStatusEnum, default: EmailStatusEnum.ACTIVE, nullable: false, comment: 'Email account status' })
    status: EmailStatusEnum;
}
