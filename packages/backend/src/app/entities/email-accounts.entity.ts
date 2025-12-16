import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EmailTypeEnum, EmailStatusEnum } from '@org/shared-models';

@Entity('email_accounts')
export class EmailAccountsEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for email accounts' })
    id: number;

    @Column('bigint', { name: 'company_id', nullable: false, comment: 'Reference to company_info table' })
    companyId: number;

    @Column('bigint', { name: 'employee_id', nullable: false, comment: 'Reference to employees table' })
    employeeId: number;

    @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'Email address' })
    email: string;

    @Column('enum', { name: 'email_type', enum: EmailTypeEnum, nullable: false, comment: 'Type of email account' })
    emailType: EmailTypeEnum;

    @Column('enum', { name: 'status', enum: EmailStatusEnum, default: EmailStatusEnum.ACTIVE, nullable: false, comment: 'Email account status' })
    status: EmailStatusEnum;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Record creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Record last update timestamp' })
    updatedAt: Date;
}
