import { Column, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EmailTypeEnum, EmailStatusEnum } from '@adminvault/shared-models';
import { CommonBaseEntity } from './common-base.entity';

@Entity('email_accounts')
export class EmailAccountsEntity extends CommonBaseEntity {

    @Column('bigint', { name: 'employee_id', nullable: false, comment: 'Reference to employees table' })
    employeeId: number;

    @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'Email address' })
    email: string;

    @Column('enum', { name: 'email_type', enum: EmailTypeEnum, nullable: false, comment: 'Type of email account' })
    emailType: EmailTypeEnum;

    @Column('enum', { name: 'status', enum: EmailStatusEnum, default: EmailStatusEnum.ACTIVE, nullable: false, comment: 'Email account status' })
    status: EmailStatusEnum;
}
