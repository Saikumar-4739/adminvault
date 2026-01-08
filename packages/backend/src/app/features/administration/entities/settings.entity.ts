import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SettingType } from '@adminvault/shared-models';

@Entity('settings')
@Index('idx_settings_user', ['userId'])
@Index('idx_settings_company', ['companyId'])
export class SettingsEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Primary key for settings' })
    id: number;

    @Column({ name: 'key', type: 'varchar', length: 255, comment: 'Setting key' })
    key: string;

    @Column({ name: 'value', type: 'text', comment: 'Setting value (JSON)' })
    value: string;

    @Column({ name: 'type', type: 'enum', enum: SettingType, default: SettingType.USER, comment: 'Setting type' })
    type: SettingType;

    @Column({ name: 'category', type: 'varchar', length: 100, nullable: true, comment: 'Setting category' })
    category: string;

    @Column({ name: 'description', type: 'text', nullable: true, comment: 'Setting description' })
    description: string;

    @Column({ name: 'company_id', type: 'bigint', nullable: true, comment: 'Company ID (for company settings)' })
    companyId: number;

    @Column({ name: 'user_id', type: 'bigint', nullable: true, comment: 'User ID (for user settings)' })
    userId: number;

    @Column({ name: 'is_encrypted', type: 'boolean', default: false, comment: 'Is value encrypted' })
    isEncrypted: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Last update timestamp' })
    updatedAt: Date;
}
