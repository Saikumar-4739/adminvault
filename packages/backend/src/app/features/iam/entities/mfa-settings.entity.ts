import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AuthUsersEntity } from './auth-users.entity';

@Entity('mfa_settings')
export class MFASettingsEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @OneToOne(() => AuthUsersEntity)
    @JoinColumn({ name: 'user_id' })
    user: AuthUsersEntity;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'is_enabled', type: 'boolean', default: false })
    isEnabled: boolean;

    @Column({ name: 'secret', type: 'varchar', length: 255, nullable: true })
    secret: string | null; // TOTP Secret key

    @Column({ name: 'mfa_type', type: 'varchar', length: 50, default: 'TOTP' })
    mfaType: string; // TOTP, SMS, EMAIL

    @Column({ name: 'recovery_codes', type: 'text', nullable: true })
    recoveryCodes: string | null; // JSON array of hashed recovery codes

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
