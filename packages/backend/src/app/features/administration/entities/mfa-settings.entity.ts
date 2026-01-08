import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('mfa_settings')
@Index('idx_mfa_user', ['userId'])
export class MFASettingsEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'company_id', type: 'bigint' })
    companyId: number;

    @Column({ name: 'is_enabled', type: 'boolean', default: false })
    isEnabled: boolean;

    @Column({ name: 'secret', type: 'varchar', length: 255, nullable: true })
    secret: string | null;

    @Column({ name: 'mfa_type', type: 'varchar', length: 50, default: 'TOTP' })
    mfaType: string;

    @Column({ name: 'recovery_codes', type: 'text', nullable: true })
    recoveryCodes: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
