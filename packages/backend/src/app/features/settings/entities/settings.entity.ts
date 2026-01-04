import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyInfoEntity } from './company-info.entity';
import { AuthUsersEntity } from './auth-users.entity';

export enum SettingType {
    USER = 'USER',
    COMPANY = 'COMPANY',
    SYSTEM = 'SYSTEM',
}

@Entity('settings')
export class SettingsEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Primary key for settings' })
    id: number;

    @Column({ name: 'key', type: 'varchar', length: 255, comment: 'Setting key' })
    key: string;

    @Column({ name: 'value', type: 'text', comment: 'Setting value (JSON)' })
    value: string;

    @Column({
        name: 'type',
        type: 'enum',
        enum: SettingType,
        default: SettingType.USER,
        comment: 'Setting type',
    })
    type: SettingType;

    @Column({ name: 'category', type: 'varchar', length: 100, nullable: true, comment: 'Setting category' })
    category: string;

    @Column({ name: 'description', type: 'text', nullable: true, comment: 'Setting description' })
    description: string;

    @Column({ name: 'company_id', type: 'bigint', nullable: true, comment: 'Company ID (for company settings)' })
    companyId: number;

    @ManyToOne(() => CompanyInfoEntity)
    @JoinColumn({ name: 'company_id' })
    company: CompanyInfoEntity;

    @Column({ name: 'user_id', type: 'bigint', nullable: true, comment: 'User ID (for user settings)' })
    userId: number;

    @ManyToOne(() => AuthUsersEntity)
    @JoinColumn({ name: 'user_id' })
    user: AuthUsersEntity;

    @Column({ name: 'is_encrypted', type: 'boolean', default: false, comment: 'Is value encrypted' })
    isEncrypted: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Last update timestamp' })
    updatedAt: Date;
}
